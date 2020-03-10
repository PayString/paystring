import { Request, Response, NextFunction } from 'express'

import knex from '../db/knex'
import Account from '../models/account'
import Address from '../models/address'

// TODO:(hbergren): Go through https://github.com/goldbergyoni/nodebestpractices, especially
// Stop passing req, res, and next in here and do that stuff on the outside.

// TODO:(hbergren) Handle both a single user and an array of users
// TODO:(hbergren) Should this handle being hit with the UUID identifying the user account as well?
export async function getUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const paymentPointer = req.query.payment_pointer

  // TODO:(hbergren) More validation? Assert that the payment pointer is `https://` and of a certain form?
  if (!paymentPointer) {
    res
      .status(400)
      .send(
        'A `payment_pointer` querystring parameter must be provided. This should be run through `encodeURIComponent` or an equivalent.',
      )
  }

  type AddressRetrieval = Pick<
    Address,
    'account_id' | 'currency' | 'network' | 'payment_information'
  >

  const addresses = await knex
    .select(
      'address.account_id',
      'address.currency',
      'address.network',
      'address.payment_information',
    )
    .from<Address>('address')
    .innerJoin<Account>('account', 'address.account_id', 'account.id')
    .where('account.payment_pointer', paymentPointer)
    // .orWhere('account.id', accountID)
    .then((rows: AddressRetrieval[]) => rows)

  if (addresses.length === 0) {
    res
      .status(404)
      .send(
        `No PayID information could be found for the payment pointer ${paymentPointer}.`,
      )
  }

  // TODO:(hbergren) Does not work for multiple accounts
  const accountID = addresses[0].account_id
  addresses.forEach((address) => {
    /* eslint-disable-next-line no-param-reassign */
    delete address.account_id
  })

  res.send({
    account_id: accountID,
    addresses,
  })
  next()
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
      console.error(err)
      // TODO:(hbergren) Don't send the whole error to the client leaking information.
      res.status(500).send(err)
    })

  type AddressInput = Pick<
    Address,
    'account_id' | 'currency' | 'network' | 'payment_information'
  >

  const addresses: AddressInput[] = req.body.addresses.map(
    (address: AddressInput) => ({
      // TODO:(hbergren) Currently I assume all properties will be filled in, but I need to handle the case where they aren't.
      // TODO:(hbergren) Remove hardcoded values.
      account_id: accountID,
      currency: address.currency.toUpperCase() || 'XRP',
      network: address.network.toUpperCase() || 'TESTNET',
      payment_information: address.payment_information,
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
      console.error(err)
      // TODO:(hbergren) Don't send the whole error to the client leaking information.
      res.status(500).send(err)
    })

  res.send({
    message: 'User inserted successfully.',
    account_id: accountID,
  })
  next()
}

export function putUser(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  // TODO(hbergren): implement user update
  res.send('TODO: put user')
  console.log('put user hit')
  next()
}

export function deleteUser(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  // TODO(hbergen(: implement user delete
  res.send('TODO: delete user')
  console.log('delete user hit')
  next()
}
