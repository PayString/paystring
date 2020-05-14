/* eslint-disable @typescript-eslint/unbound-method */
import { Transaction } from 'knex'

import knex from '../db/knex'
import { Account, Address, AddressInformation } from '../types/database'
import logger from '../utils/logger'

/**
 * Inserts a new user/PayID into the account table in the PayID database.
 *
 * @param payId - The PayID to insert in the account table.
 * @param addresses - The payment addresses for that PayID to insert into the database.
 *
 * @returns The addresses inserted for this user.
 */
// TODO(hbergren): Type payId better
// TODO:(hbergren) Accept an array of users (insertUsers?)
export async function insertUser(
  payId: string,
  addresses: readonly AddressInformation[],
): Promise<readonly AddressInformation[]> {
  return knex.transaction(async (transaction: Transaction) => {
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
}

/**
 * Update the PayID and addresses for a given user.
 *
 * @param oldPayId - The old PayID of the user.
 * @param newPayId - The new PayID of the user.
 * @param addresses - The array of payment address information to associate with this user.
 *
 * @returns The updated payment addresses for a given PayID.
 */
export async function replaceUser(
  oldPayId: string,
  newPayId: string,
  addresses: readonly AddressInformation[],
): Promise<readonly AddressInformation[] | null> {
  return knex.transaction(async (transaction: Transaction) => {
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
}

/**
 * Deletes a user from the database.
 * Addresses associated with that user should be automatically removed by a cascading delete.
 *
 * @param payId - The PayID associated with the user to delete.
 */
export async function removeUser(payId: string): Promise<void> {
  await knex<Account>('account')
    .delete()
    .where('pay_id', payId)
    .then((count) => {
      /* istanbul ignore if */
      if (count > 1) {
        // If we deleted more than one user, all bets are off, because multiple users could have the same PayID.
        // This should be impossible thanks to our unique constraint,
        // but this would mean that PayID resolution (and thus who gets transferred value) is non-deterministic.
        // Thus, we log an error and immediately kill the program.
        logger.fatal(
          `We deleted ${count} accounts with the PayID ${payId}, which should be impossible due to our unique constraint.`,
        )
        process.exit(1)
      }
    })
}

// HELPER FUNCTIONS

interface DatabaseAddress extends AddressInformation {
  account_id: string
}

/**
 * Maps an array of AddressInformation objects into an array of DatabaseAddress objects,
 * by adding an 'account_id' property to each object.
 *
 * @param addresses - An array of payment addresses we want to insert into the database.
 * @param accountID - The account ID to add to all the addresses to allow inserting the addresses into the database.
 *
 * @returns A new array of DatabaseAddress objects, where each address has a new property 'account_id'.
 */
function addAccountIDToAddresses(
  addresses: readonly AddressInformation[],
  accountID: string,
): readonly DatabaseAddress[] {
  return addresses.map((address) => ({
    account_id: accountID,
    payment_network: address.payment_network.toUpperCase(),
    environment: address.environment?.toUpperCase(),
    details: address.details,
  }))
}

/**
 * Given an array of address objects and a transaction, insert the addresses into the database.
 *
 * @param addresses - An array of DatabaseAddress objects to insert into the database.
 * @param transaction - The transaction to wrap this statement with.
 *                      Used to ensure that when we insert/update a user, we maintain consistent data.
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
