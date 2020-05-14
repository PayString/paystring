import knex from '../db/knex'
import { Address, AddressInformation } from '../types/database'

/**
 * Retrieve all of the address information associated with a given PayID.
 *
 * @param payId - The PayID used to retrieve address information.
 */
export default async function getAllAddressInfoFromDatabase(
  payId: string,
): Promise<readonly AddressInformation[]> {
  const addressInformation = await knex
    .select('address.payment_network', 'address.environment', 'address.details')
    .from<Address>('address')
    .innerJoin('account', 'address.account_id', 'account.id')
    .where('account.pay_id', payId)

  return addressInformation
}
