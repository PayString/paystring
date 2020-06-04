import { Request, Response, NextFunction } from 'express'

import getAllAddressInfoFromDatabase from '../data-access/payIds'
import createMemo from '../hooks/memo'
import {
  formatPaymentInfo,
  getPreferredAddressHeaderPair,
} from '../services/basePayId'
import { parseAcceptHeaders } from '../services/headers'
import { recordPayIdLookupResult } from '../services/metrics'
import { urlToPayId, constructUrl } from '../services/urls'
import HttpStatus from '../types/httpStatus'
import { handleHttpError, LookupError, LookupErrorType } from '../utils/errors'

/**
 * Resolves inbound requests to a PayID to their respective ledger addresses or other payment information.
 *
 * @param req - Contains PayID and payment network header.
 * @param res - Stores payment information to be returned to the client.
 * @param next - Passes req/res to next middleware.
 *
 * @returns A Promise resolving to nothing.
 */
export default async function getPaymentInfo(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  let payId: string
  try {
    // * NOTE: If you plan to expose your PayID with a port number, you
    // * should include req.port as a fourth parameter.
    const payIdUrl = constructUrl(req.protocol, req.hostname, req.url)

    // Parses the constructed URL to confirm it can be converted into a valid PayID
    payId = urlToPayId(payIdUrl)
  } catch (err) {
    return handleHttpError(HttpStatus.BadRequest, err.message, res, err)
  }

  // Parses any accept headers to make sure they use valid PayID syntax
  //  - This overload (req.accepts()) isn't mentioned in the express documentation,
  // but if there are no args provided, an array of types sorted by preference
  // is returned
  // https://github.com/jshttp/accepts/blob/master/index.js#L96
  const parsedAcceptHeaders = parseAcceptHeaders(req.accepts())

  // Get all addresses from DB
  const allAddressInfo = await getAllAddressInfoFromDatabase(payId)

  // Content-negotiation to get preferred payment information
  const preferredAddressInfo = getPreferredAddressHeaderPair(
    allAddressInfo,
    parsedAcceptHeaders,
  )

  // TODO:(hbergren) Distinguish between missing PayID in system, and missing address for paymentNetwork/environment.
  // Respond with a 404 if we can't find the requested payment information
  if (preferredAddressInfo === undefined) {
    let message = `Payment information for ${payId} could not be found.`
    // When we only have a single accept type, we can give a more detailed error message
    if (parsedAcceptHeaders.length === 1) {
      const { paymentNetwork, environment } = parsedAcceptHeaders[0]
      message = `Payment information for ${payId} in ${paymentNetwork} `
      // eslint-disable-next-line max-depth -- TODO:(@dino-rodriguez) This should be refactored
      if (environment) {
        message += `on ${environment} `
      }
      message += 'could not be found.'
    }
    parsedAcceptHeaders.forEach((acceptType) =>
      recordPayIdLookupResult(
        acceptType.paymentNetwork,
        acceptType.environment ?? 'unknown',
        false,
      ),
    )

    throw new LookupError(message, LookupErrorType.Unknown)
  }

  const {
    preferredParsedAcceptHeader,
    preferredAddresses,
  } = preferredAddressInfo

  // Wrap addresses into PaymentInformation object (this is the response in Base PayID)
  // * NOTE: To append a memo, MUST set a memo in createMemo()
  const formattedPaymentInfo = formatPaymentInfo(
    preferredAddresses,
    payId,
    createMemo,
  )

  // Set the content-type to the media type corresponding to the returned address
  res.set('Content-Type', preferredParsedAcceptHeader.mediaType)

  // Store response information (or information to be used in other middlewares)
  // TODO:(hbergren), come up with a less hacky way to pipe around data than global state.
  res.locals.payId = payId
  res.locals.paymentInformation = formattedPaymentInfo
  res.locals.response = formattedPaymentInfo
  recordPayIdLookupResult(
    preferredParsedAcceptHeader.paymentNetwork,
    preferredParsedAcceptHeader.environment ?? 'unknown',
    true,
  )
  return next()
}
