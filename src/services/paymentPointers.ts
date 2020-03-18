import knex from '../db/knex'
import Account from '../models/account'
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

/**
 * Update a payment pointer for a given account ID.
 *
 * @param oldPaymentPointer The old payment pointer.
 * @param newPaymentPointer The new payment pointer.
 *
 * @returns A JSON object with the new payment pointer and the accountID, or `undefined` if nothing could be found for that payment pointer.
 */
export async function updatePaymentPointer(
  oldPaymentPointer: string,
  newPaymentPointer: string,
): Promise<Pick<Account, 'id' | 'payment_pointer'> | undefined> {
  const data = await knex<Account>('account')
    .where('payment_pointer', oldPaymentPointer)
    .update({ payment_pointer: newPaymentPointer })
    .returning(['id', 'payment_pointer'])
    .then((rows) => rows[0])

  return data
}

/**
 * Update addresses for a given account ID.
 *
 * @param accountID The account ID of the account to be updated.
 * @param addresses The object representing destination/address information.
 *
 * @returns A JSON object representing the payment information, or `undefined` if nothing could be found for that payment pointer.
 */
// TODO: update types after destructuring Pick in routes/users.ts
export async function replaceAddressInformation(
  accountID: string,
  // TODO: This isn't truly an Address array, maybe more of an AddressInput array
  addresses: Address[],
): Promise<Pick<Address, 'currency' | 'network' | 'payment_information'>[]> {
  // TODO:(hbergren) Currently I assume all properties will be filled in, but I need to handle the case where they aren't.
  // TODO:(hbergren) Remove hardcoded values.
  const mappedAddresses = addresses.map((address) => ({
    account_id: accountID,
    currency: address.currency.toUpperCase() || 'XRP',
    network: address.network.toUpperCase() || 'TESTNET',
    payment_information: address.payment_information,
  }))

  // Delete existing addresses associated with that user
  await knex<Address>('address')
    .del()
    .where('account_id', accountID)

  // Insert new addresses
  const updatedAddresses = await knex
    .insert(mappedAddresses)
    .into<Address>('address')
    .returning(['currency', 'network', 'payment_information'])
    .then((rows) => rows)

  return updatedAddresses
}
