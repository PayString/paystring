import knex from '../db/knex'
import { AddressCount } from '../types/reports'

/**
 * Retrieve count of addresses, grouped by payment network and environment.
 *
 * @returns A list with the number of addresses that have a given (paymentNetwork, environment) tuple,
 *          ordered by (paymentNetwork, environment).
 */
export async function getAddressCounts(): Promise<AddressCount[]> {
  const addressCounts: AddressCount[] = await knex
    .select('address.paymentNetwork', 'address.environment')
    .count('* as count')
    .from<AddressCount>('address')
    .groupBy('address.paymentNetwork', 'address.environment')
    .orderBy(['address.paymentNetwork', 'address.environment'])

  return addressCounts.map((addressCount) => ({
    paymentNetwork: addressCount.paymentNetwork,
    environment: addressCount.environment,
    count: Number(addressCount.count),
  }))
}

/**
 * Retrieve the count of PayIDs in the database.
 *
 * @returns The count of PayIDs that exist for this PayID server.
 */
export async function getPayIdCount(): Promise<number> {
  const payIdCount: number = await knex
    .count('* as count')
    .from<Account>('account')
    .then((record) => {
      return Number(record[0].count)
    })

  return payIdCount
}
