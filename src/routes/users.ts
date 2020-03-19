import { Request, Response, NextFunction } from 'express'

import handleHttpError from '../services/errors'
import { replaceUser, replaceAddresses, removeUser } from '../services/users'
import { urlToPaymentPointer, paymentPointerToUrl } from '../services/utils'

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
