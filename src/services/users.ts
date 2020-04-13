/* eslint-disable @typescript-eslint/unbound-method */
import { Transaction } from 'knex'

import knex from '../db/knex'
import { Account, Address } from '../types/database'
import logger from '../utils/logger'

/**
 * The information retrieved from or inserted into the database for a given address.
 */
type AddressInformation = Pick<
  Address,
  'payment_network' | 'environment' | 'details'
>

/**
 * Retrieve the addresses associated with a given users payment pointer.
 * @param paymentPointer The payment pointer (user) for which to retrieve addresses.
 * @param organization The organization with authorization to perform CRUD operations on this user on the PayID service.
 *
 * @returns An array of the addresses associated with that payment pointer.
 */
// TODO(hbergren): Type paymentPointer better?
// TODO(hbergren): remove default value for organization
export async function selectUser(
  paymentPointer: string,
  organization = 'xpring',
): Promise<AddressInformation[]> {
  const addresses: AddressInformation[] = await knex
    .select('address.payment_network', 'address.environment', 'address.details')
    .from<Address>('address')
    .innerJoin<Account>('account', 'address.account_id', 'account.id')
    .where('account.payment_pointer', paymentPointer)
    .andWhere('account.organization', organization)

  return addresses
}

/**
 * Inserts a new user/payment_pointer into the Account table on the PayID service.
 * @param paymentPointer The payment pointer to insert in the users table.
 * @param addresses The addresses for that payment pointer to insert into the database.
 * @param organization The organization with authorization to perform CRUD operations on this user on the PayID service.
 *
 * @returns The addresses inserted for this user
 */
// TODO(hbergren): Type paymentPointer better
// TODO:(hbergren): Remove default value of `xpring` for organization
// TODO:(hbergren) Accept an array of users (insertUsers?)
export async function insertUser(
  paymentPointer: string,
  addresses: AddressInformation[],
  organization = 'xpring',
): Promise<AddressInformation[]> {
  // TODO:(hbergren) Need to handle all the possible CHECK constraint and UNIQUE constraint violations in a catch block
  // Or do checks in JS to ensure no constraints are violated. Or both.
  return knex.transaction(async (transaction: Transaction) => {
    const insertedAddresses = await knex
      .insert({
        payment_pointer: paymentPointer,
        organization,
      })
      .into<Account>('account')
      .transacting(transaction)
      .returning('id')
      .then(async (ids) => {
        const accountID = ids[0]
        const mappedAddresses = addAccountIDToAddresses(addresses, accountID)
        return insertAddresses(mappedAddresses, transaction)
      })
      .then(transaction.commit)
      .catch(transaction.rollback)

    return insertedAddresses
  })
}

/**
 * Update a payment pointer and addresses associated with that payment pointer for a given account ID.
 * @param oldPaymentPointer The old payment pointer.
 * @param newPaymentPointer The new payment pointer.
 * @param addresses The array of destination/address information to associate with this user.
 *
 * @returns The updated addresses for a given payment pointer.
 */
export async function replaceUser(
  oldPaymentPointer: string,
  newPaymentPointer: string,
  addresses: AddressInformation[],
): Promise<void> {
  return knex.transaction(async (transaction: Transaction) => {
    const updatedAddresses = await knex<Account>('account')
      .where('payment_pointer', oldPaymentPointer)
      .update({ payment_pointer: newPaymentPointer })
      .transacting(transaction)
      .returning('id')
      .then(async (ids) => {
        const accountID = ids[0]
        if (accountID === undefined) return null

        // Delete existing addresses associated with that user
        await knex<Address>('address')
          .delete()
          .where('account_id', accountID)
          .transacting(transaction)

        const mappedAddresses = addAccountIDToAddresses(addresses, accountID)
        return insertAddresses(mappedAddresses, transaction)
      })
      .then(transaction.commit)
      .catch(transaction.rollback)

    return updatedAddresses
  })
}

/**
 * Deletes a user from the database. Addresses associated with that user should be removed by a cascading delete.
 * @param paymentPointer The payment pointer associated with the user to delete.
 */
export async function removeUser(paymentPointer: string): Promise<void> {
  await knex<Account>('account')
    .delete()
    .where('payment_pointer', paymentPointer)
    .then((count) => {
      if (count <= 1) return

      // If we deleted more than one user, all bets are off, because multiple users could have the same payment pointer.
      // This should be impossible thanks to our unique constraint,
      // but this would mean that payment pointer resolution (and thus who gets transferred value) is non-deterministic.
      // Thus, we log an error and immediately kill the program.
      logger.fatal(
        `We deleted ${count} accounts with the payment pointer ${paymentPointer}, which should be impossible due to our unique constraint.`,
      )
      process.exit(1)
    })
}

/*
 * HELPER FUNCTIONS
 */
interface DatabaseAddress extends AddressInformation {
  account_id: string
}

/**
 * Maps an array of AddressInformation objects into an array of DatabaseAddress objects, with an 'account_id'.
 * @param addresses An array of addresses with information we want to insert into the database.
 * @param accountID the account ID to add to all the addresses to allow inserting the addresses into the database.
 *
 * @returns A new array of addresses, where each address has a new property 'account_id'.
 */
function addAccountIDToAddresses(
  addresses: AddressInformation[],
  accountID: string,
): DatabaseAddress[] {
  return addresses.map((address) => ({
    // TODO:(hbergren) Currently I assume all properties will be filled in, but I need to handle the case where they aren't.
    account_id: accountID,
    payment_network: address.payment_network.toUpperCase(),
    environment: address.environment?.toUpperCase(),
    details: address.details,
  }))
}

/**
 * Given an array of address objects and a transaction, insert the addresses into the database.
 * @param addresses An array of DatabaseAddress objects to insert into the database.
 * @param transaction The transaction to wrap this statement with. Used to ensure that when we insert/update a user, we maintain consistent data.
 *
 * @returns An array of the inserted addresses.
 */
async function insertAddresses(
  addresses: DatabaseAddress[],
  transaction: Transaction,
): Promise<AddressInformation[]> {
  // TODO:(hbergren) Verify that the number of inserted addresses matches the input address array length?
  return knex
    .insert(addresses)
    .into<Address>('address')
    .transacting(transaction)
    .returning(['payment_network', 'environment', 'details'])
}
