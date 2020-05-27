import { Request, Response, NextFunction } from 'express'

import getAllAddressInfoFromDatabase from '../data-access/payIds'
import {
  recordPayIdLookupBadAcceptHeader,
  recordPayIdLookupResult,
} from '../services/metrics'
import { urlToPayId, constructUrl } from '../services/utils'
import { AddressInformation } from '../types/database'
import HttpStatus from '../types/httpStatus'
import {
  PaymentInformation,
  AddressDetailsType,
  CryptoAddressDetails,
  AchAddressDetails,
} from '../types/publicAPI'
import {
  AcceptMediaType,
  getPreferredPaymentInfo,
  parseAcceptMediaType,
} from '../utils/acceptHeader'
import { handleHttpError, LookupError, LookupErrorType } from '../utils/errors'
import appendMemo from '../utils/memo'

// HELPERS

/**
 * Finds the best payment address information given an array of Accept header types ordered by preference.
 *
 * @param payId - The PayID used to retrieve address information.
 * @param sortedAcceptTypes - An array of AcceptMediaTypes, sorted by preference.
 *
 * @returns The best payment address information associated with a PayID for a set of sorted Accept types,
 *          or undefined if the address information could not be found.
 */
async function getAddressInfoForAcceptTypes(
  payId: string,
  sortedAcceptTypes: readonly AcceptMediaType[],
): Promise<
  | {
      acceptType: AcceptMediaType
      addressInformation: AddressInformation
    }
  | undefined
> {
  if (!sortedAcceptTypes.length) {
    return undefined
  }

  // TODO:(tedkalaw) Improve this query
  const allPaymentInformation = await getAllAddressInfoFromDatabase(payId)
  return getPreferredPaymentInfo(allPaymentInformation, sortedAcceptTypes)
}

/**
 * Resolves inbound requests to a PayID to their respective ledger addresses or other payment information.
 *
 * @param req - Contains PayID and payment network header.
 * @param res - Stores payment information to be returned to the client.
 * @param next - Passes req/res to next middleware.
 */
export default async function getPaymentInfo(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  let payId: string
  try {
    // NOTE: If you plan to expose your PayID with a port number, you
    // should include req.port as a fourth parameter
    const payIdUrl = constructUrl(req.protocol, req.hostname, req.url)

    // Checks that the constructed URL can be converted into a valid PayID
    payId = urlToPayId(payIdUrl)
  } catch (err) {
    return handleHttpError(HttpStatus.BadRequest, err.message, res, err)
  }

  // This overload isn't mentioned in the express documentation, but if there are no
  // args provided, an array of types sorted by preference is returned
  // https://github.com/jshttp/accepts/blob/master/index.js#L96
  const acceptHeaderTypes = req.accepts()

  // MUST include at least 1 accept header
  if (!acceptHeaderTypes.length) {
    // Collect metrics on bad request
    recordPayIdLookupBadAcceptHeader()

    return handleHttpError(
      HttpStatus.BadRequest,
      `Missing Accept header. Must have an Accept header of the form 'application/{paymentNetwork}(-{environment})+json'.
      Examples:
      - 'Accept: application/xrpl-mainnet+json'
      - 'Accept: application/btc-testnet+json'
      - 'Accept: application/ach+json'
      - 'Accept: application/payid+json'
      `,
      res,
    )
  }

  // Accept types MUST be the proper format
  let parsedAcceptTypes: readonly AcceptMediaType[]
  try {
    parsedAcceptTypes = acceptHeaderTypes.map((type) =>
      parseAcceptMediaType(type),
    )
  } catch (error) {
    // Collect metrics on bad request
    recordPayIdLookupBadAcceptHeader()

    return handleHttpError(
      HttpStatus.BadRequest,
      `Invalid Accept header. Must be of the form 'application/{paymentNetwork}(-{environment})+json'.
      Examples:
      - 'Accept: application/xrpl-mainnet+json'
      - 'Accept: application/btc-testnet+json'
      - 'Accept: application/ach+json'
      - 'Accept: application/payid+json'
      `,
      res,
      error,
    )
  }

  // Content-negotiation to get preferred payment information
  const result = await getAddressInfoForAcceptTypes(payId, parsedAcceptTypes)

  // TODO:(hbergren) Distinguish between missing PayID in system, and missing address for paymentNetwork/environment.
  // Or is `application/json` the appropriate response Content-Type?
  if (result === undefined) {
    let message = `Payment information for ${payId} could not be found.`
    if (parsedAcceptTypes.length === 1) {
      // When we only have a single accept type, we can give a more detailed error message
      const { paymentNetwork, environment } = parsedAcceptTypes[0]
      message = `Payment information for ${payId} in ${paymentNetwork} on ${environment} could not be found.`
    }
    parsedAcceptTypes.forEach((acceptType) =>
      recordPayIdLookupResult(
        acceptType.paymentNetwork,
        acceptType.environment,
        false,
      ),
    )

    throw new LookupError(message, LookupErrorType.Unknown)
  }

  const { acceptType, addressInformation } = result
  // Set the content-type to the media type corresponding to the returned address
  res.set('Content-Type', acceptType.mediaType)

  // TODO:(hbergren) Create a helper function for this?
  let response: PaymentInformation = {
    addressDetailsType: AddressDetailsType.CryptoAddress,
    addressDetails: addressInformation.details as CryptoAddressDetails,
  }
  if (addressInformation.paymentNetwork === 'ACH') {
    response = {
      addressDetailsType: AddressDetailsType.AchAddress,
      addressDetails: addressInformation.details as AchAddressDetails,
    }
  }

  response = appendMemo(response)

  // Store response information (or information to be used in other middlewares)
  // TODO:(hbergren), come up with a less hacky way to pipe around data than global state.
  res.locals.payId = payId
  res.locals.paymentInformation = response
  res.locals.response = response
  recordPayIdLookupResult(
    addressInformation.paymentNetwork,
    addressInformation.environment ?? 'unknown',
    true,
  )
  return next()
}
