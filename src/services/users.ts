import { Request, Response, NextFunction } from 'express'

import knex from '../db/knex'
import Account from '../models/account'
import Address from '../models/address'

export function getUser(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.send('TODO: get user')
  console.log('get user hit')
  // TODO(hbergen): implement retrieval
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
