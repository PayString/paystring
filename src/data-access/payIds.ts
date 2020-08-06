import knex from '../db/knex'
import { Address, AddressInformation } from '../types/database'

/**
 * Retrieve all of the address information associated with a given PayID from the database.
 *
 * @param payId - The PayID used to retrieve address information.
 * @returns All of the address information associated with a given PayID.
 */
export async function getAllAddressInfoFromDatabase(
  payId: string,
): Promise<readonly AddressInformation[]> {
  const addressInformation = await knex
    .select('address.paymentNetwork', 'address.environment', 'address.details')
    .from<Address>('address')
    .innerJoin('account', 'address.accountId', 'account.id')
    .where('account.payId', payId)

  return addressInformation
}

/**
 * Retrieves the identity key for a specific PayID.
 *
 * @param payId - The PayID that we are requesting an identityKey for.
 * @returns The identity key for that PayID if it exists.
 */
export async function getIdentityKeyFromDatabase(
  payId: string,
): Promise<string | null> {
  const identityKey = await knex
    .select('account.identityKey')
    .from<Account>('account')
    .where('account.payId', payId)

  return identityKey[0].identityKey
}
