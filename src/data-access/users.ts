/* eslint-disable @typescript-eslint/unbound-method */
import { Transaction } from 'knex'

import knex from '../db/knex'
import { Account, Address, AddressInformation } from '../types/database'
import { handleDatabaseError } from '../utils/errors'
import logger from '../utils/logger'

/**
 * Retrieve the addresses associated with a given users PayID.
 * @param payId - The PayID (user) for which to retrieve addresses.
 *
 * @returns An array of the addresses associated with that PayID.
 */
// TODO(hbergren): Type payId better?
export async function selectUser(
  payId: string,
): Promise<readonly AddressInformation[]> {
  const addresses: readonly AddressInformation[] = await knex
    .select('address.payment_network', 'address.environment', 'address.details')
    .from<Address>('address')
    .innerJoin<Account>('account', 'address.account_id', 'account.id')
    .where('account.pay_id', payId)

  return addresses
}

/**
 * Inserts a new user/pay_id into the Account table on the PayID service.
 * @param payId - The PayID to insert in the users table.
 * @param addresses - The addresses for that PayID to insert into the database.
 *
 * @returns The addresses inserted for this user
 */
// TODO(hbergren): Type payId better
// TODO:(hbergren) Accept an array of users (insertUsers?)
export async function insertUser(
  payId: string,
  addresses: readonly AddressInformation[],
): Promise<readonly AddressInformation[]> {
  // TODO:(hbergren) Need to handle all the possible CHECK constraint and UNIQUE constraint violations in a catch block
  // Or do checks in JS to ensure no constraints are violated. Or both.
  return knex
    .transaction(async (transaction: Transaction) => {
      const insertedAddresses = await knex
        .insert({
          pay_id: payId,
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
    .catch((error) => {
      handleDatabaseError(error, payId)
    })
}

/**
 * Update a PayID and addresses associated with that PayID for a given account ID.
 * @param oldPayId - The old PayID.
 * @param newPayId - The new PayID.
 * @param addresses - The array of destination/address information to associate with this user.
 *
 * @returns The updated addresses for a given PayID.
 */
export async function replaceUser(
  oldPayId: string,
  newPayId: string,
  addresses: readonly AddressInformation[],
): Promise<readonly AddressInformation[] | null> {
  return knex
    .transaction(async (transaction: Transaction) => {
      const updatedAddresses = await knex<Account>('account')
        .where('pay_id', oldPayId)
        .update({ pay_id: newPayId })
        .transacting(transaction)
        .returning('id')
        .then(async (ids) => {
          const accountID = ids[0]
          if (accountID === undefined) {
            return null
          }

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
    .catch((error) => {
      handleDatabaseError(error, newPayId)
    })
}

/**
 * Deletes a user from the database. Addresses associated with that user should be removed by a cascading delete.
 * @param payId - The PayID associated with the user to delete.
 */
export async function removeUser(payId: string): Promise<void> {
  await knex<Account>('account')
    .delete()
    .where('pay_id', payId)
    .then((count) => {
      if (count <= 1) {
        return
      }

      // If we deleted more than one user, all bets are off, because multiple users could have the same PayID.
      // This should be impossible thanks to our unique constraint,
      // but this would mean that PayID resolution (and thus who gets transferred value) is non-deterministic.
      // Thus, we log an error and immediately kill the program.
      logger.fatal(
        `We deleted ${count} accounts with the PayID ${payId}, which should be impossible due to our unique constraint.`,
      )
      process.exit(1)
    })
}

// HELPER FUNCTIONS
interface DatabaseAddress extends AddressInformation {
  account_id: string
}

/**
 * Maps an array of AddressInformation objects into an array of DatabaseAddress objects, with an 'account_id'.
 * @param addresses - An array of addresses with information we want to insert into the database.
 * @param accountID - the account ID to add to all the addresses to allow inserting the addresses into the database.
 *
 * @returns A new array of addresses, where each address has a new property 'account_id'.
 */
function addAccountIDToAddresses(
  addresses: readonly AddressInformation[],
  accountID: string,
): readonly DatabaseAddress[] {
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
 * @param addresses - An array of DatabaseAddress objects to insert into the database.
 * @param transaction - The transaction to wrap this statement with. Used to ensure that when we insert/update a user, we maintain consistent data.
 *
 * @returns An array of the inserted addresses.
 */
async function insertAddresses(
  addresses: readonly DatabaseAddress[],
  transaction: Transaction,
): Promise<readonly AddressInformation[]> {
  // TODO:(hbergren) Verify that the number of inserted addresses matches the input address array length?
  return knex
    .insert(addresses)
    .into<Address>('address')
    .transacting(transaction)
    .returning(['payment_network', 'environment', 'details'])
}
