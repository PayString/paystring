/* eslint-disable max-lines -- TODO: Remove this disable when we have better parsing/validation */

import HttpStatus from '@xpring-eng/http-status'
import { Request, Response, NextFunction } from 'express'

import config, { adminApiVersions } from '../config'
import {
  getAllAddressInfoFromDatabase,
  getAllVerifiedAddressInfoFromDatabase,
  getIdentityKeyFromDatabase,
} from '../data-access/payIds'
import {
  insertUser,
  replaceUser,
  removeUser,
  replaceUserPayId,
  checkUserExistence,
} from '../data-access/users'
import parseAllAddresses from '../services/users'
import { formatPaymentInfo } from '../services/basePayId'
import {
  LookupError,
  LookupErrorType,
  ParseError,
  ParseErrorType,
} from '../utils/errors'

/**
 * Retrieve all the information about that PayID.
 *
 * @param req - An Express Request object, holding the PayID.
 * @param res - An Express Response object.
 * @param next - An Express next() function.
 *
 * @throws A ParseError if the PayID is missing.
 * @throws A LookupError if the PayID has no associated addresses.
 *
 * TODO:(hbergren): Handle retrieving an array of users as well as a single user?
 */
export async function getUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // TODO:(dino) Validate PayID
  const payId = req.params.payId.toLowerCase()

  // TODO:(hbergren) More validation? Assert that the PayID is `https://` and of a certain form?
  // Could use a similar regex to the one used by the database.
  if (!payId) {
    throw new ParseError(
      'A `payId` must be provided in the path. A well-formed API call would look like `GET /users/alice$xpring.money`.',
      ParseErrorType.MissingPayId,
    )
  }

  // TODO:(hbergren) Does not work for multiple accounts
  const doesUserExist = await checkUserExistence(payId)
  if (!doesUserExist) {
    throw new LookupError(
      `No information could be found for the PayID ${payId}.`,
      LookupErrorType.Unknown,
    )
  }

  const addresses = await getAllAddressInfoFromDatabase(payId)
  const verifiedAddresses = await getAllVerifiedAddressInfoFromDatabase(payId)
  const identityKey = await getIdentityKeyFromDatabase(payId)

  // We can be sure the version is defined because we verified it in checkRequestAdminApiVersionHeaders middleware
  const requestVersion = String(req.get('PayID-API-Version'))

  if (requestVersion < adminApiVersions[1]) {
    res.locals.response = {
      payId,
      ...(identityKey && { identityKey }),
      addresses,
      verifiedAddresses,
    }
  } else {
    // Return same format as Public API
    res.locals.response = formatPaymentInfo(
      addresses,
      verifiedAddresses,
      identityKey,
      config.app.payIdVersion,
      payId,
    )
  }

  next()
}

// TODO:(hbergren) Handle both single user and array of new users
// TODO:(hbergren) Any sort of validation? Validate XRP addresses have both X-Address & Classic/DestinationTag?
// TODO:(hbergren) Any sort of validation on the PayID? Check the domain name to make sure it's owned by that organization?
// TODO:(hbergren) Use joi to validate the `req.body`. All required properties present, and match some sort of validation.
/**
 * Create a new PayID.
 *
 * @param req - An Express Request object, holding PayID information.
 * @param res - An Express Response object.
 * @param next - An Express next() function.
 *
 * @throws ParseError if the PayID is missing from the request body.
 */
export async function postUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // TODO:(hbergren) Any validation? Assert that the PayID is `https://` and of a certain form?
  // Do that using a regex route param in Express?
  // Could use a similar regex to the one used by the database. Also look at validation in the conversion functions.
  const rawPayId = req.body.payId
  if (!rawPayId || typeof rawPayId !== 'string') {
    throw new ParseError(
      'A `payId` must be provided in the request body.',
      ParseErrorType.MissingPayId,
    )
  }
  const payId = rawPayId.toLowerCase()

  // TODO:(hbergren) Need to test here and in `putUser()` that `req.body.addresses` is well formed.
  // This includes making sure that everything that is not ACH or ILP is in a CryptoAddressDetails format.
  // And that we `toUpperCase()` paymentNetwork and environment as part of parsing the addresses.
  // * NOTE: We can be sure the version is defined because we verified it in checkRequestAdminApiVersionHeaders middleware
  const [allAddresses, identityKey] = parseAllAddresses(
    req.body.addresses,
    req.body.verifiedAddresses,
    req.body.identityKey,
    String(req.get('PayID-API-Version')),
  )

  await insertUser(payId, allAddresses, identityKey)

  // Set HTTP status and save the PayID to generate the Location header in later middleware
  res.locals.status = HttpStatus.Created
  res.locals.payId = payId
  next()
}

/**
 * Either create a new PayID, or update an existing PayID.
 *
 * @param req - An Express Request object, with a body holding the new PayID information.
 * @param res - An Express Response object.
 * @param next - An Express next() function.
 *
 * @throws A ParseError if either PayID is missing or invalid.
 */
// eslint-disable-next-line max-lines-per-function -- Disabling until I finish building the functionality here.
export async function putUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // TODO:(hbergren) Validate req.body and throw a 400 Bad Request when appropriate
  // TODO(hbergren): pull this PayID / HttpError out into middleware?
  const rawPayId = req.params.payId
  const rawNewPayId = req.body?.payId

  // TODO:(hbergren) More validation? Assert that the PayID is `$` and of a certain form?
  // Do that using a regex route param in Express?
  // Could use a similar regex to the one used by the database.
  if (!rawPayId) {
    throw new ParseError(
      'A `payId` must be provided in the path. A well-formed API call would look like `PUT /users/alice$xpring.money`.',
      ParseErrorType.MissingPayId,
    )
  }

  if (!rawNewPayId || typeof rawNewPayId !== 'string') {
    throw new ParseError(
      'A `payId` must be provided in the request body.',
      ParseErrorType.MissingPayId,
    )
  }

  // TODO:(dino) move this to validation
  if (!rawPayId.includes('$') || !rawNewPayId.includes('$')) {
    throw new ParseError(
      'Bad input. PayIDs must contain a "$"',
      ParseErrorType.InvalidPayId,
    )
  }

  // TODO:(hbergren) We should rip this out since PayIDs now officially support multiple '$'.
  if (
    (rawPayId.match(/\$/gu) || []).length !== 1 ||
    (rawNewPayId.match(/\$/gu) || []).length !== 1
  ) {
    throw new ParseError(
      'Bad input. PayIDs must contain only one "$"',
      ParseErrorType.InvalidPayId,
    )
  }

  // We can be sure the version is defined because we verified it in checkRequestAdminApiVersionHeaders middleware
  const requestVersion = String(req.get('PayID-API-Version'))
  const payId = rawPayId.toLowerCase()
  const newPayId = rawNewPayId.toLowerCase()

  // TODO:(dino) validate body params before this
  const [allAddresses, identityKey] = parseAllAddresses(
    req.body.addresses,
    req.body.verifiedAddresses,
    req.body.identityKey,
    String(req.get('PayID-API-Version')),
  )

  // Attempt to replace user
  let updatedAddresses = await replaceUser(
    payId,
    newPayId,
    allAddresses,
    identityKey,
  )
  // If user does not exist, create
  if (updatedAddresses === null) {
    updatedAddresses = await insertUser(newPayId, allAddresses, identityKey)
    // If the status code is 201 - Created, we need to set a Location header later with the PayID
    res.locals.status = HttpStatus.Created
    res.locals.payId = newPayId
  }

  // Only show created output on the "old" API
  if (requestVersion < adminApiVersions[1]) {
    const addresses = updatedAddresses
      .filter((address) => !address.identityKeySignature)
      .map((address) => ({
        paymentNetwork: address.paymentNetwork,
        environment: address.environment,
        details: address.details,
      }))

    const verifiedAddresses = updatedAddresses.filter((address) =>
      Boolean(address.identityKeySignature),
    )

    res.locals.response = {
      payId: newPayId,
      addresses,
      verifiedAddresses,
    }
  }

  next()
}

/**
 * Removes a PayID from the PayID server.
 *
 * @param req - An Express Request object, holding the PayID.
 * @param res - An Express Response object.
 * @param next - An Express next() function.
 *
 * @throws A ParseError if the PayID is missing from the request.
 */
export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // TODO:(hbergren) This absolutely needs to live in middleware
  const payId = req.params.payId.toLowerCase()

  // TODO:(hbergren) More validation? Assert that the PayID is `https://` and of a certain form?
  // Do that using a regex route param in Express? Could use a similar regex to the one used by the database.
  if (!payId) {
    throw new ParseError(
      'A PayID must be provided in the path. A well-formed API call would look like `DELETE /users/alice$xpring.money`.',
      ParseErrorType.MissingPayId,
    )
  }

  await removeUser(payId)

  res.locals.status = HttpStatus.NoContent
  next()
}

/**
 * Updates a PayID only, not the addresses.
 *
 * @param req - An Express Request object, holding the PayID.
 * @param res - An Express Response object.
 * @param next - An Express next() function.
 *
 * @throws A ParseError if the PayID is missing from the request.
 * @throws A LookupError if the PayID doesn't already exist in the database.
 */
export async function patchUserPayId(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const rawOldPayId = req.params.payId
  if (!rawOldPayId) {
    throw new ParseError(
      'A `payId` must be provided in the path. A well-formed API call would look like `PATCH /users/alice$xpring.money`.',
      ParseErrorType.MissingPayId,
    )
  }

  // "Potential" because we don't know yet if there will be an error or not
  const rawNewPotentialPayId = req.body.payId

  if (!rawNewPotentialPayId || typeof rawNewPotentialPayId !== 'string') {
    throw new ParseError(
      'A `payId` must be provided in the request body.',
      ParseErrorType.MissingPayId,
    )
  }

  // TODO: move this to validation
  if (!rawOldPayId.includes('$') || !rawNewPotentialPayId.includes('$')) {
    throw new ParseError(
      'Bad input. PayIDs must contain a "$"',
      ParseErrorType.InvalidPayId,
    )
  }

  // TODO: We should rip this out since PayIDs now officially support multiple '$'.
  if (
    (rawOldPayId.match(/\$/gu) || []).length !== 1 ||
    (rawNewPotentialPayId.match(/\$/gu) || []).length !== 1
  ) {
    throw new ParseError(
      'Bad input. PayIDs must contain only one "$"',
      ParseErrorType.InvalidPayId,
    )
  }
  const newPayId = rawNewPotentialPayId.toLowerCase()
  const oldPayId = rawOldPayId.toLowerCase()

  const verifiedAddresses = await getAllVerifiedAddressInfoFromDatabase(
    oldPayId,
  )

  if (verifiedAddresses.length > 0) {
    throw new ParseError(
      'Cannot PATCH a PayID with verified addresses, as that would break the address signatures. Please use the PUT endpoint to update this PayID.',
      ParseErrorType.IncompatibleRequestMethod,
    )
  }

  const account = await replaceUserPayId(oldPayId, newPayId)

  // If we try to update a PayID which doesn't exist, the 'account' object will be null.
  if (!account) {
    throw new LookupError(
      `The PayID ${oldPayId} doesn't exist.`,
      LookupErrorType.MissingPayId,
    )
  }

  res.locals.status = HttpStatus.Created
  res.locals.payId = newPayId

  next()
}
