import knex from '../db/knex'
import { Address, AddressInformation } from '../types/database'

/**
 *
 * Retrieve all of the payment information associated with a given PayID.
 * @param payId - The PayID to retrieve payment information for.
 */
export default async function getAllPaymentInfoFromDatabase(
  payId: string,
): Promise<readonly AddressInformation[]> {
  const paymentInformation = await knex
    .select('address.payment_network', 'address.environment', 'address.details')
    .from<Address>('address')
    .innerJoin('account', 'address.account_id', 'account.id')
    .where('account.pay_id', payId)

  return paymentInformation
}
