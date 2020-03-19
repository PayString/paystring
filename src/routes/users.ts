import { Request, Response, NextFunction } from 'express'

import handleHttpError from '../services/errors'
import {
  selectUser,
  insertUser,
  insertAddresses,
  replaceUser,
  replaceAddresses,
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

  // TODO:(hbergren) It's weird that you can successfully insert a user, but fail to insert associated addresses.
  // That means that a failed POST request could have still had side-effects and inserted data into the database.
  // That probably shouldn't be possible. This might be a problem for the PUT request as well.
  let accountID: string
  try {
    accountID = await insertUser(paymentPointerUrl)
  } catch (err) {
    return handleHttpError(
      503,
      `The server could not create an account for the payment pointer ${paymentPointer}`,
      res,
      err,
    )
  }

  try {
    // TODO(hbergren): Some sort of address validation before we pass this along?
    await insertAddresses(accountID, req.body.addresses)
  } catch (err) {
    return handleHttpError(
      503,
      `server could not insert addresses for user ${paymentPointer}`,
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

  // TODO(dino): validate body params before this
  let updatedAccountInfo
  try {
    // TODO(hans): destructure this Pick object
    updatedAccountInfo = await replaceUser(
      paymentPointerUrl,
      newPaymentPointerUrl,
    )

    // TODO:(hbergren), this should create the user if they didn't exist
    // Can we just hit the POST implementation?
    if (updatedAccountInfo === undefined) {
      return handleHttpError(404, `User for ${paymentPointer} not found.`, res)
    }
  } catch (err) {
    return handleHttpError(
      500,
      `Error updating payment pointer for account ${req.query.payment_pointer}.`,
      res,
      err,
    )
  }

  let updatedAddresses
  // TODO:(hbergren), only have a single try/catch for all this?
  try {
    updatedAddresses = await replaceAddresses(
      updatedAccountInfo.id,
      req.body.addresses,
    )
  } catch (err) {
    return handleHttpError(
      500,
      `Error updating addresses for account ${req.body.account_id}.`,
      res,
    )
  }

  res.locals.response = {
    payment_pointer: urlToPaymentPointer(updatedAccountInfo.payment_pointer),
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
