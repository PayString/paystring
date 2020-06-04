import knex from '../db/knex'
import { Address, AddressInformation } from '../types/database'

/**
 * Retrieve all of the address information associated with a given PayID from the database.
 *
 * @param payId - The PayID used to retrieve address information.
 * @returns All of the address information associated with a given PayID.
 */
export default async function getAllAddressInfoFromDatabase(
  payId: string,
): Promise<readonly AddressInformation[]> {
  const addressInformation = await knex
    .select('address.paymentNetwork', 'address.environment', 'address.details')
    .from<Address>('address')
    .innerJoin('account', 'address.accountId', 'account.id')
    .where('account.payId', payId)

  return addressInformation
}
