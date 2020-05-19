import { Request, Response, NextFunction } from 'express'

import getAllAddressInfoFromDatabase from '../data-access/payIds'
import { insertUser, replaceUser, removeUser } from '../data-access/users'
import HttpStatus from '../types/httpStatus'
import { handleHttpError, LookupError, LookupErrorType } from '../utils/errors'

// TODO:(hbergren): Go through https://github.com/goldbergyoni/nodebestpractices, especially
// Stop passing req, res, and next in here and do that stuff on the outside.

// TODO:(hbergren) Handle both a single user and an array of users
// TODO:(hbergren) Should this handle being hit with the UUID identifying the user account as well?
export async function getUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // TODO:(dino) Validate PayID
  const payId = req.params[0]

  // TODO:(hbergren) More validation? Assert that the PayID is `https://` and of a certain form?
  // Do that using a regex route param in Express?
  // Could use a similar regex to the one used by the database.
  if (!payId) {
    return handleHttpError(
      HttpStatus.BadRequest,
      'A `payId` must be provided in the path. A well-formed API call would look like `GET /v1/users/alice$xpring.money`.',
      res,
    )
  }

  let addresses
  try {
    // TODO:(hbergren) Does not work for multiple accounts
    addresses = await getAllAddressInfoFromDatabase(payId)
  } catch (err) {
    return handleHttpError(
      HttpStatus.InternalServerError,
      err.message,
      res,
      err,
    )
  }

  if (addresses.length === 0) {
    throw new LookupError(
      `No information could be found for the PayID ${payId}.`,
      LookupErrorType.Unknown,
    )
  }

  res.locals.response = {
    payId,
    addresses,
  }

  return next()
}

// TODO:(hbergren) Handle both single user and array of new users
// TODO:(hbergren) Any sort of validation? Validate XRP addresses have both X-Address & Classic/DestinationTag?
// TODO:(hbergren) Any sort of validation on the PayID? Check the domain name to make sure it's owned by that organization?
// TODO:(hbergren) Use joi to validate the `req.body`. All required properties present, and match some sort of validation.
export async function postUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // TODO:(hbergren) Any validation? Assert that the PayID is `https://` and of a certain form?
  // Do that using a regex route param in Express?
  // Could use a similar regex to the one used by the database. Also look at validation in the conversion functions.
  const payId = req.body.payId
  if (!payId) {
    return handleHttpError(
      HttpStatus.BadRequest,
      'A `payId` must be provided in the request body.',
      res,
    )
  }

  // TODO:(hbergren) Need to test here and in `putUser()` that `req.body.addresses` is well formed.
  // This includes making sure that everything that is not ACH or ILP is in a CryptoAddressDetails format.
  // And that we `toUpperCase()` paymentNetwork and environment as part of parsing the addresses.
  await insertUser(payId, req.body.addresses)

  // Set HTTP status and save the PayID to generate the Location header in later middleware
  res.locals.status = HttpStatus.Created
  res.locals.payId = payId
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
  const newPayId = req?.body?.payId
  const addresses = req?.body?.addresses

  // TODO:(hbergren) More validation? Assert that the PayID is `$` and of a certain form?
  // Do that using a regex route param in Express?
  // Could use a similar regex to the one used by the database.
  if (!payId) {
    return handleHttpError(
      HttpStatus.BadRequest,
      'A `payId` must be provided in the path. A well-formed API call would look like `PUT /v1/users/alice$xpring.money`.',
      res,
    )
  }

  if (!newPayId) {
    return handleHttpError(
      HttpStatus.BadRequest,
      'A `payId` must be provided in the request body.',
      res,
    )
  }

  // TODO:(dino) move this to validation
  if (!payId.includes('$') || !newPayId.includes('$')) {
    return handleHttpError(
      HttpStatus.BadRequest,
      'Bad input. PayIDs must contain a "$"',
      res,
    )
  }

  // TODO:(dino) move this to validation
  if (
    (payId.match(/\$/gu) || []).length !== 1 ||
    (newPayId.match(/\$/gu) || []).length !== 1
  ) {
    return handleHttpError(
      HttpStatus.BadRequest,
      'Bad input. PayIDs must contain only one "$"',
      res,
    )
  }

  // TODO:(hbergren) Remove all these try/catches. This is ridiculous
  // TODO(dino): validate body params before this
  let updatedAddresses
  let statusCode = HttpStatus.OK

  updatedAddresses = await replaceUser(payId, newPayId, addresses)
  if (updatedAddresses === null) {
    updatedAddresses = await insertUser(newPayId, addresses)
    statusCode = HttpStatus.Created
  }

  // If the status code is 201 - Created, we need to set a Location header later with the PayID
  if (statusCode === HttpStatus.Created) {
    res.locals.payId = newPayId
  }

  res.locals.status = statusCode
  res.locals.response = {
    payId: newPayId,
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

  // TODO:(hbergren) More validation? Assert that the PayID is `https://` and of a certain form?
  // Do that using a regex route param in Express? Could use a similar regex to the one used by the database.
  if (!payId) {
    return handleHttpError(
      HttpStatus.BadRequest,
      'A PayID must be provided in the path. A well-formed API call would look like `GET /v1/users/alice$xpring.money`.',
      res,
    )
  }

  try {
    await removeUser(payId)
  } catch (err) {
    return handleHttpError(
      HttpStatus.InternalServerError,
      err.message,
      res,
      err,
    )
  }

  res.locals.status = HttpStatus.NoContent
  return next()
}
