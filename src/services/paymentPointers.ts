import knex from '../db/knex'
import Address from '../models/address'

/**
 * Retrieve the payment information for a given payment pointer.
 *
 * @param paymentPointer The Payment Pointer to retrieve payment information for.
 * @param currency The currency used to filter addresses (XRP, BTC, USD)
 * @param network The network used to filter addresses (MAINNET, TESTNET, DEVNET)
 *
 * @returns A JSON object representing the payment information, or `undefined` if nothing could be found for that payment pointer.
 */
export default async function getPaymentInfoFromDatabase(
  // TODO:(hbergren) refactor the call signature to take an object rather than 3 params?
  // TODO:(hbergren) Type payment pointer better? `https://...?`
  paymentPointer: string,
  currency: string,
  network: string,
): Promise<Address['payment_information'] | undefined> {
  // Get the payment_information from the database, given our paymentPointer, currency, and network
  const paymentInformation = await knex
    .select('address.payment_information')
    .from<Address>('address')
    .innerJoin('account', 'address.account_id', 'account.id')
    .where('account.payment_pointer', paymentPointer)
    .andWhere('address.currency', currency)
    .andWhere('address.network', network)
    .then((rows: Pick<Address, 'payment_information'>[]) => {
      return rows[0]?.payment_information
    })

  return paymentInformation
}
