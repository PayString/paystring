import knex from '../db/knex'
import { PayIdCount } from '../types/reports'

/**
 * Retrieve count of PayIDs, grouped by payment network and environment.
 *
 * @returns A list with the number of PayIDs that have a given (paymentNetwork, environment) tuple,
 *          ordered by (paymentNetwork, environment).
 */
export default async function getPayIdCounts(): Promise<PayIdCount[]> {
  const payIdCounts: PayIdCount[] = await knex
    .select('address.paymentNetwork', 'address.environment')
    .count('* as count')
    .from<PayIdCount>('address')
    .groupBy('address.paymentNetwork', 'address.environment')
    .orderBy(['address.paymentNetwork', 'address.environment'])

  return payIdCounts.map((record) => {
    return {
      paymentNetwork: record.paymentNetwork,
      environment: record.environment,
      count: Number(record.count),
    }
  })
}
