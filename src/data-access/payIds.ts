import knex from '../db/knex'
import { Address, AddressInformation } from '../types/database'

/**
 * Retrieve the payment information for a given PayID.
 *
 * @param payId - The PayID to retrieve payment information for.
 * @param paymentNetwork - The payment network used to filter addresses (XRPL, BTC, ACH)
 * @param environment - The environment used to filter addresses (MAINNET, TESTNET, DEVNET)
 *
 * @returns A JSON object representing the payment information, or `undefined` if nothing could be found for that PayID.
 */
export default async function getPaymentInfoFromDatabase(
  // TODO:(hbergren) refactor the call signature to take an object rather than 3 params?
  // TODO:(hbergren) Type PayID better? `https://...?`
  payId: string,
  paymentNetwork: string,
  environment: string,
): Promise<AddressInformation | undefined> {
  // Get the details from the database, given our payId, paymentNetwork, and environment
  const paymentInformation = await knex
    .select('address.payment_network', 'address.environment', 'address.details')
    .from<AddressInformation>('address')
    .innerJoin('account', 'address.account_id', 'account.id')
    .where('account.pay_id', payId)
    .andWhere('address.payment_network', paymentNetwork)
    .andWhere((builder) => {
      if (environment) {
        builder.where('address.environment', environment)
      } else {
        builder.whereNull('address.environment')
      }
    })
    .then((rows: readonly AddressInformation[]) => {
      // TODO(hbergren): More than one row possible?
      // Throw error if that happens?
      return rows[0]
    })

  return paymentInformation
}

/**
 *
 * Retrieve all of the payment information associated with a given PayID.
 * @param payId - The PayID to retrieve payment information for.
 */
export async function getAllPaymentInfoFromDatabase(
  payId: string,
): Promise<readonly AddressInformation[]> {
  const paymentInformation = await knex
    .select('address.payment_network', 'address.environment', 'address.details')
    .from<Address>('address')
    .innerJoin('account', 'address.account_id', 'account.id')
    .where('account.pay_id', payId)

  return paymentInformation
}
