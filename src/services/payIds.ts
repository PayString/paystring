import knex from '../db/knex'
import { Address } from '../types/database'

/**
 * Retrieve the payment information for a given payment pointer.
 *
 * @param paymentPointer The Payment Pointer to retrieve payment information for.
 * @param paymentNetwork The payment network used to filter addresses (XRPL, BTC, ACH)
 * @param environment The environment used to filter addresses (MAINNET, TESTNET, DEVNET)
 *
 * @returns A JSON object representing the payment information, or `undefined` if nothing could be found for that payment pointer.
 */
export default async function getPaymentInfoFromDatabase(
  // TODO:(hbergren) refactor the call signature to take an object rather than 3 params?
  // TODO:(hbergren) Type payment pointer better? `https://...?`
  paymentPointer: string,
  paymentNetwork: string,
  environment: string,
): Promise<
  Pick<Address, 'payment_network' | 'environment' | 'details'> | undefined
> {
  // Get the details from the database, given our paymentPointer, paymentNetwork, and environment
  const paymentInformation = await knex
    .select('address.payment_network', 'address.environment', 'address.details')
    .from<Address>('address')
    .innerJoin('account', 'address.account_id', 'account.id')
    .where('account.payment_pointer', paymentPointer)
    .andWhere('address.payment_network', paymentNetwork)
    .andWhere('address.environment', environment)
    .then(
      (
        rows: Pick<Address, 'payment_network' | 'environment' | 'details'>[],
      ) => {
        // TODO(hbergren): More than one row possible?
        // Throw error if that happens?
        return rows[0]
      },
    )

  return paymentInformation
}
