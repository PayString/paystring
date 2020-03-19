import { Request, Response, NextFunction } from 'express'

import knex from '../db/knex'
import Account from '../db/models/account'
import Address from '../db/models/address'

import handleHttpError from './errors'
import { urlToPaymentPointer, paymentPointerToUrl } from './utils'

// TODO:(hbergren): Go through https://github.com/goldbergyoni/nodebestpractices, especially
// Stop passing req, res, and next in here and do that stuff on the outside.

// TODO:(hbergren) Handle both a single user and an array of users
// TODO:(hbergren) Should this handle being hit with the UUID identifying the user account as well?
export async function getUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const paymentPointer = req.params[0]

  // TODO:(hbergren) More validation? Assert that the payment pointer is `https://` and of a certain form?
  // Do that using a regex route param in Express?
  // Could use a similar regex to the one used by the database.
  if (!paymentPointer) {
    return handleHttpError(
      400,
      'A `payment_pointer` must be provided in the path. A well-formed API call would look like `GET /v1/users/$xpring.money/hbergren`.',
      res,
    )
  }

  let paymentPointerUrl
  try {
    paymentPointerUrl = paymentPointerToUrl(paymentPointer)
  } catch (err) {
    return handleHttpError(400, err.message, res, err)
  }

  type AddressRetrieval = Pick<
    Address,
    'payment_network' | 'environment' | 'details'
  >

  const addresses = await knex
    .select('address.payment_network', 'address.environment', 'address.details')
    .from<Address>('address')
    .innerJoin<Account>('account', 'address.account_id', 'account.id')
    .where('account.payment_pointer', paymentPointerUrl)
    // .orWhere('account.id', accountID)
    .then((rows: AddressRetrieval[]) => rows)

  if (addresses.length === 0) {
    return handleHttpError(
      404,
      `No PayID information could be found for the payment pointer ${paymentPointer}.`,
      res,
    )
  }

  // TODO:(hbergren) Does not work for multiple accounts
  res.locals.response = {
    payment_pointer: urlToPaymentPointer(paymentPointerUrl),
    addresses,
  }

  return next()
}

// TODO:(hbergren) Handle both single user and array of new users
// TODO:(hbergren) Any sort of validation? Validate XRP addresses have both X-Address & Classic/DestinationTag?
// TODO:(hbergren) Any sort of validation on the payment pointer? Check the domain name to make sure it's owned by that organization?
// TODO:(hbergren) Use joi to validate the `req.body`. All required properties present, and match some sort of validation.
export async function postUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // TODO:(hbergren) Handle an array or users as well
  // TODO:(hbergren) Need to handle all the possible CHECK constraint and UNIQUE constraint violations in a catch block
  // Or do checks in JS to ensure no constraints are violated.
  const accountID = await knex
    .insert({
      // TODO:(hbergren) Do some preprocessing here? Don't pass req directly?
      payment_pointer: req.body.payment_pointer,
      // TODO:(hbergren) Make this organization field calculated from the API key used, not hardcoded
      organization: 'xpring',
    })
    .into<Account>('account')
    .returning('id')
    .then((rows) => rows[0])
    .catch((err) => {
      return handleHttpError(
        503,
        `server could not create account for user ${req.body.payment_pointer}`,
        res,
        err,
      )
    })

  type AddressInput = Pick<
    Address,
    'account_id' | 'payment_network' | 'environment' | 'details'
  >

  // TODO: Consolidate this with PUT addresses
  const addresses: AddressInput[] = req.body.addresses.map(
    (address: AddressInput) => ({
      // TODO:(hbergren) Currently I assume all properties will be filled in, but I need to handle the case where they aren't.
      // TODO:(hbergren) Remove hardcoded values.
      account_id: accountID,
      payment_network: address.payment_network.toUpperCase() || 'XRPL',
      environment: address.environment.toUpperCase() || 'TESTNET',
      details: address.details,
    }),
  )

  // TODO:(hbergren) Should this return anything?
  // TODO:(hbergren) Need to handle all the possible CHECK constraint and UNIQUE constraint violations in a catch block
  // Or do checks in JS to ensure no constraints are violated.
  await knex
    .insert(addresses)
    .into<Address>('address')
    .then(() => ({ inserted: true }))
    .catch((err) => {
      return handleHttpError(
        503,
        `server could not insert addresses for user ${accountID}`,
        res,
        err,
      )
    })

  res.locals.response = {
    message: `User for payment pointer ${req.body.payment_pointer} created successfully.`,
    account_id: accountID,
  }

  return next()
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
