import knex from '../db/knex'
import { PayIdCount } from '../types/reports'

/**
 * Retrieve count of PayIDs, grouped by payment network and environment
 */
export const getPayIdCounts = async function getPayIdCounts(): Promise<
  PayIdCount[]
> {
  const payIdCounts: PayIdCount[] = await knex
    .select('address.payment_network', 'address.environment')
    .count('* as count')
    .from<PayIdCount>('address')
    .groupBy('address.payment_network', 'address.environment')
    .orderBy('address.payment_network')
    .orderBy('address.environment')

  return payIdCounts.map((record) => {
    return {
      payment_network: record.payment_network,
      environment: record.environment,
      count: Number(record.count),
    }
  })
}

export default getPayIdCounts
