import { Request, Response, NextFunction } from 'express'

import handleHttpError from '../services/errors'
import {
  selectUser,
  insertUser,
  replaceUser,
  removeUser,
} from '../services/users'
import { urlToPaymentPointer, paymentPointerToUrl } from '../services/utils'

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

  let addresses
  try {
    // TODO:(hbergren) Does not work for multiple accounts
    addresses = await selectUser(paymentPointerUrl)
  } catch (err) {
    return handleHttpError(500, err.message, res, err)
  }

  if (addresses.length === 0) {
    return handleHttpError(
      404,
      `No PayID information could be found for the payment pointer ${paymentPointer}.`,
      res,
    )
  }

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
  // TODO:(hbergren) More validation? Assert that the payment pointer is `https://` and of a certain form?
  // Do that using a regex route param in Express?
  // Could use a similar regex to the one used by the database.
  const paymentPointer = req.body.payment_pointer
  if (!paymentPointer) {
    return handleHttpError(
      400,
      'A `payment_pointer` must be provided in the path. A well-formed API call would look like `GET /v1/users/$xpring.money/hbergren`.',
      res,
    )
  }

  let paymentPointerUrl: string
  try {
    paymentPointerUrl = paymentPointerToUrl(paymentPointer)
  } catch (err) {
    return handleHttpError(400, err.message, res, err)
  }

  try {
    await insertUser(paymentPointerUrl, req.body.addresses)
  } catch (err) {
    // TODO(hbergren): This leaks database stuff into this file
    // This probably means error handling should be done in the data access layer
    if (
      err.message.includes(
        'violates unique constraint "account_payment_pointer_key"',
      )
    ) {
      return handleHttpError(
        409,
        `There already exists a user with the payment pointer ${paymentPointer}`,
        res,
        err,
      )
    }

    return handleHttpError(
      500,
      `The server could not create an account for the payment pointer ${paymentPointer}`,
      res,
      err,
    )
  }

  res.locals.status = 201 // Created
  return next()
}

export async function putUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // TODO:(hbergren) Validate req.body and throw a 400 Bad Request when appropriate
  // TODO(hbergren): pull this paymentPointer / HttpError out into middleware?
  const paymentPointer = req.params[0]
  // TODO:(hbergren) More validation? Assert that the payment pointer is `$` and of a certain form?
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
  let newPaymentPointerUrl
  try {
    paymentPointerUrl = paymentPointerToUrl(paymentPointer)
    newPaymentPointerUrl = paymentPointerToUrl(req.body.payment_pointer)
  } catch (err) {
    return handleHttpError(400, err.message, res, err)
  }

  // TODO:(hbergren) Remove all these try/catches. This is ridiculous
  // TODO(dino): validate body params before this
  let updatedAddresses
  let statusCode = 200
  try {
    // TODO:(hbergren) Remove this ridiculous nesting.
    updatedAddresses = await replaceUser(
      paymentPointerUrl,
      newPaymentPointerUrl,
      req.body.addresses,
    )
    if (updatedAddresses === null) {
      updatedAddresses = await insertUser(
        newPaymentPointerUrl,
        req.body.addresses,
      )
      statusCode = 201
    }
  } catch (err) {
    // TODO(hbergren): This leaks database stuff into this file
    // This probably means error handling should be done in the data access layer
    if (
      err.message.includes(
        'violates unique constraint "account_payment_pointer_key"',
      )
    ) {
      return handleHttpError(
        409,
        `There already exists a user with the payment pointer ${paymentPointer}`,
        res,
        err,
      )
    }

    return handleHttpError(
      500,
      `Error updating payment pointer for account ${req.query.payment_pointer}.`,
      res,
      err,
    )
  }

  res.locals.status = statusCode
  res.locals.response = {
    payment_pointer: urlToPaymentPointer(newPaymentPointerUrl),
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
  const paymentPointer = req.params[0]

  // TODO:(hbergren) More validation? Assert that the payment pointer is `https://` and of a certain form?
  // Do that using a regex route param in Express? Could use a similar regex to the one used by the database.
  if (!paymentPointer) {
    return handleHttpError(
      400,
      'A `payment_pointer` must be provided in the path. A well-formed API call would look like `GET /v1/users/$xpring.money/hbergren`.',
      res,
    )
  }

  let paymentPointerUrl: string
  try {
    paymentPointerUrl = paymentPointerToUrl(paymentPointer)
  } catch (err) {
    return handleHttpError(400, err.message, res, err)
  }

  try {
    await removeUser(paymentPointerUrl)
  } catch (err) {
    return handleHttpError(500, err.message, res, err)
  }

  res.locals.status = 204 // No Content
  return next()
}
