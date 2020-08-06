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
    .whereNull('address.identityKeySignature')

  return addressInformation
}
           
/**
 * Retrieve all verified adress data associated with a given PayID.
 *
 * @param payId -- The PayID used to retrieve verified address information.
 * @returns All of the verified addresses associated with the given PayID.
 */
export async function getAllVerifiedAddressInfoFromDatabase(
  payId: string,
): Promise<readonly AddressInformation[]> {
  const addressInformation = await knex
    .select(
      'address.paymentNetwork',
      'address.environment',
      'address.details',
      'address.identityKeySignature',
    )
    .from<Address>('address')
    .innerJoin('account', 'address.accountId', 'account.id')
    .where('account.payId', payId)
    .whereNotNull('address.identityKeySignature')

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
