import { Request, Response, NextFunction } from 'express'

import {
  selectUser,
  insertUser,
  replaceUser,
  removeUser,
} from '../services/users'

import handleHttpError from './errors'

// TODO:(hbergren): Go through https://github.com/goldbergyoni/nodebestpractices, especially
// Stop passing req, res, and next in here and do that stuff on the outside.

// TODO:(hbergren) Handle both a single user and an array of users
// TODO:(hbergren) Should this handle being hit with the UUID identifying the user account as well?
export async function getUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // TODO:(dino) Validate paymentPointer
  const payId = req.params[0]

  // TODO:(hbergren) More validation? Assert that the payment pointer is `https://` and of a certain form?
  // Do that using a regex route param in Express?
  // Could use a similar regex to the one used by the database.
  if (!payId) {
    return handleHttpError(
      400,
      'A `payId` must be provided in the path. A well-formed API call would look like `GET /v1/users/alice$xpring.money`.',
      res,
    )
  }

  let addresses
  try {
    // TODO:(hbergren) Does not work for multiple accounts
    addresses = await selectUser(payId)
  } catch (err) {
    return handleHttpError(500, err.message, res, err)
  }

  if (addresses.length === 0) {
    return handleHttpError(
      404,
      `No information could be found for the PayID ${payId}.`,
      res,
    )
  }

  res.locals.response = {
    pay_id: payId,
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
  // TODO:(hbergren) Any validation? Assert that the payment pointer is `https://` and of a certain form?
  // Do that using a regex route param in Express?
  // Could use a similar regex to the one used by the database. Also look at validation in the conversion functions.
  const payId = req.body.pay_id
  if (!payId) {
    return handleHttpError(
      400,
      'A `pay_id` must be provided in the path. A well-formed API call would look like `GET /v1/users/alice$xpring.money`.',
      res,
    )
  }

  try {
    await insertUser(payId, req.body.addresses)
  } catch (err) {
    // TODO(hbergren): This leaks database stuff into this file
    // This probably means error handling should be done in the data access layer
    if (
      err.message.includes('violates unique constraint "account_pay_id_key"')
    ) {
      return handleHttpError(
        409,
        `There already exists a user with the PayId ${payId}`,
        res,
        err,
      )
    }

    return handleHttpError(
      500,
      `The server could not create an account for the PayID ${payId}`,
      res,
      err,
    )
  }

  // Set HTTP status and save the payment pointer to generate the Location header in later middleware
  res.locals.status = 201 // Created
  res.locals.pay_id = payId
  return next()
}

export async function putUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // TODO:(hbergren) Validate req.body and throw a 400 Bad Request when appropriate
  // TODO(hbergren): pull this PayID / HttpError out into middleware?
  const payId = req.params[0]
  const newPayId = req?.body?.pay_id
  const addresses = req?.body?.addresses
  // TODO:(hbergren) More validation? Assert that the payment pointer is `$` and of a certain form?
  // Do that using a regex route param in Express?
  // Could use a similar regex to the one used by the database.
  if (!payId || !newPayId) {
    return handleHttpError(
      400,
      'A `payment_pointer` must be provided in the path. A well-formed API call would look like `GET /v1/users/$xpring.money/hbergren`.',
      res,
    )
  }

  // TODO:(dino) move this to validation
  if (!payId.includes('$') || !newPayId.includes('$')) {
    return handleHttpError(400, 'Bad input. PayIDs must contain a "$"', res)
  }

  // TODO:(hbergren) Remove all these try/catches. This is ridiculous
  // TODO(dino): validate body params before this
  let updatedAddresses
  let statusCode = 200
  try {
    // TODO:(hbergren) Remove this ridiculous nesting.
    updatedAddresses = await replaceUser(payId, newPayId, addresses)
    if (updatedAddresses === null) {
      updatedAddresses = await insertUser(newPayId, addresses)
      statusCode = 201
    }
  } catch (err) {
    // TODO(hbergren): This leaks database stuff into this file
    // This probably means error handling should be done in the data access layer
    if (
      err.message.includes('violates unique constraint "account_pay_id_key"')
    ) {
      return handleHttpError(
        409,
        `There already exists a user with the payment pointer ${payId}`,
        res,
        err,
      )
    }

    return handleHttpError(
      500,
      `Error updating payment pointer for account ${req.query.pay_id}.`,
      res,
      err,
    )
  }

  // If the status code is 201 - Created, we need to set a Location header later with the payment pointer
  if (statusCode === 201) {
    res.locals.pay_id = newPayId
  }

  res.locals.status = statusCode
  res.locals.response = {
    pay_id: newPayId,
    addresses: updatedAddresses,
  }

  return next()
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // TODO(hbergren): This absolutely needs to live in middleware
  const payId = req.params[0]

  // TODO:(hbergren) More validation? Assert that the payment pointer is `https://` and of a certain form?
  // Do that using a regex route param in Express? Could use a similar regex to the one used by the database.
  if (!payId) {
    return handleHttpError(
      400,
      'A `pay_id` must be provided in the path. A well-formed API call would look like `GET /v1/users/alice$xpring.money`.',
      res,
    )
  }

  try {
    await removeUser(payId)
  } catch (err) {
    return handleHttpError(500, err.message, res, err)
  }

  res.locals.status = 204 // No Content
  return next()
}
