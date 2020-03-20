import knex from '../db/knex'
import Account from '../db/models/account'
import Address from '../db/models/address'

/**
 * The information retrieved from or inserted into the database for a given address.
 */
type AddressInformation = Pick<
  Address,
  'payment_network' | 'environment' | 'details'
>

/**
 * Retrieve the addresses associated with a given users payment pointer.
 *
 * @param paymentPointerUrl The payment pointer (user) for which to retrieve addresses.
 * @param organization The organization with authorization to perform CRUD operations on this user on the PayID service.
 *
 * @returns An array of the addresses associated with that payment pointer.
 */
export async function selectAddresses(
  // TODO(hbergren): Type paymentPointer better?
  paymentPointerUrl: string,
  // TODO(hbergren): remove default value
  organization = 'xpring',
): Promise<AddressInformation[]> {
  const addresses = await knex
    .select('address.payment_network', 'address.environment', 'address.details')
    .from<Address>('address')
    .innerJoin<Account>('account', 'address.account_id', 'account.id')
    .where('account.payment_pointer', paymentPointerUrl)
    .andWhere('account.organization', organization)
    .then((rows: AddressInformation[]) => rows)

  return addresses
}

/**
 * Inserts a new user/payment_pointer into the Account table on the PayID service.
 *
 * @param paymentPointerUrl The payment pointer to insert in the users table.
 * @param organization The organization with authorization to perform CRUD operations on this user on the PayID service.
 *
 * @returns The account id used by the database as a primary key to reference this user.
 */
// TODO(hbergren): Type paymentPointerUrl better
// TODO:(hbergren): Remove default value of `xpring` for organization
export async function insertUser(
  paymentPointerUrl: string,
  organization = 'xpring',
): Promise<string> {
  // TODO:(hbergren) Handle an array of users as well
  // TODO:(hbergren) Need to handle all the possible CHECK constraint and UNIQUE constraint violations in a catch block
  // Or do checks in JS to ensure no constraints are violated.
  const accountID = await knex
    .insert({
      payment_pointer: paymentPointerUrl,
      organization,
    })
    .into<Account>('account')
    .returning('id')
    .then((rows) => rows[0])

  return accountID
}

/**
 * Inserts new addresses into the database for a given account id.
 *
 * @param accountID The database account id associated with the payment pointer to insert new addresses for.
 * @param addresses The addresses to insert into the database.
 */
export async function insertAddresses(
  accountID: string,
  addresses: AddressInformation[],
): Promise<void> {
  // TODO(hbergren): Consolidate this with PUT addresses
  const mappedAddresses = addresses.map((address) => ({
    // TODO:(hbergren) Currently I assume all properties will be filled in, but I need to handle the case where they aren't.
    // TODO:(hbergren) Remove hardcoded values.
    account_id: accountID,
    payment_network: address.payment_network.toUpperCase() || 'XRPL',
    environment: address.environment.toUpperCase() || 'TESTNET',
    details: address.details,
  }))

  // TODO:(hbergren) Should this return anything?
  // TODO:(hbergren) Need to handle all the possible CHECK constraint and UNIQUE constraint violations in a catch block
  // Or do checks in JS to ensure no constraints are violated.
  await knex.insert(mappedAddresses).into<Address>('address')
  // TODO:(hbergren) Verify that the number of inserted addresses matches the input address array length?
  // .then((count) => count[0])
}

/**
 * Update a payment pointer for a given account ID.
 *
 * @param oldPaymentPointerUrl The old payment pointer.
 * @param newPaymentPointerUrl The new payment pointer.
 *
 * @returns A JSON object with the new payment pointer and the accountID, or `undefined` if nothing could be found for that payment pointer.
 */
export async function replaceUser(
  oldPaymentPointerUrl: string,
  newPaymentPointerUrl: string,
): Promise<string | undefined> {
  const accountID = await knex<Account>('account')
    .where('payment_pointer', oldPaymentPointerUrl)
    .update({ payment_pointer: newPaymentPointerUrl })
    .returning(['id'])
    .then((rows) => rows[0]?.id)

  return accountID
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
export async function replaceAddresses(
  accountID: string,
  // TODO: This isn't truly an Address array, maybe more of an AddressInput array
  addresses: Address[],
): Promise<AddressInformation[]> {
  // TODO:(hbergren) Currently I assume all properties will be filled in, but I need to handle the case where they aren't.
  // TODO:(hbergren) Remove hardcoded values.
  const mappedAddresses = addresses.map((address) => ({
    account_id: accountID,
    payment_network: address.payment_network.toUpperCase() || 'XRPL',
    environment: address.environment.toUpperCase() || 'TESTNET',
    details: address.details,
  }))

  // Delete existing addresses associated with that user
  await knex<Address>('address')
    .delete()
    .where('account_id', accountID)
  // TODO:(hbergren) Record or return the count of deleted addresses?
  // .then((count) => count)

  // console.log(`Deleted ${deletedAddressCount} addresses in replaceAddressInformation.`)

  // Insert new addresses
  const updatedAddresses = await knex
    .insert(mappedAddresses)
    .into<Address>('address')
    .returning(['payment_network', 'environment', 'details'])
    .then((rows) => rows)

  return updatedAddresses
}

/**
 * Deletes a user from the database.
 * (Addresses associated with that user should be removed by a cascading delete.)
 *
 * @param paymentPointerUrl The payment pointer associated with the user to delete.
 */
export async function removeUser(paymentPointerUrl: string): Promise<void> {
  await knex<Account>('account')
    .delete()
    .where('payment_pointer', paymentPointerUrl)
  // TODO: Add some check that we only deleted a single user? Program would be really broken if that was violated
  // .then((count) => count)

  // console.log(`Deleted ${deletedUserCount} accounts.`)
}
