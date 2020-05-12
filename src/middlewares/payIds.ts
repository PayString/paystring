import { Request, Response, NextFunction } from 'express'

import getAllPaymentInfoFromDatabase from '../data-access/payIds'
import {
  recordPayIdLookupBadAcceptHeader,
  recordPayIdLookupResult,
} from '../services/metrics'
import { urlToPayId, constructUrl } from '../services/utils'
import { AddressInformation } from '../types/database'
import HttpStatus from '../types/httpStatus'
import {
  PaymentInformation,
  AddressDetailType,
  CryptoAddressDetails,
  AchAddressDetails,
} from '../types/publicAPI'
import {
  AcceptMediaType,
  getPreferredPaymentInfo,
  parseAcceptMediaType,
} from '../utils/acceptHeader'
import { handleHttpError, LookupError, LookupErrorType } from '../utils/errors'

// HELPERS

/**
 * Returns the best payment information associated with a payId for a set of sorted
 * Accept types.
 *
 * Returns undefined if payment infomation could not be found.
 *
 * @param payId - The PayID to retrieve payment information for
 * @param sortedAcceptTypes - An array of AcceptTypes, sorted by preference
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
  const allPaymentInformation = await getAllPaymentInfoFromDatabase(payId)
  return getPreferredPaymentInfo(allPaymentInformation, sortedAcceptTypes)
}

/**
 * Resolves inbound requests to a PayID to their
 * respective ledger addresses or other payment information.
 *
 * @param req - Contains PayID and payment network header
 * @param res - Stores payment information to be returned to the client
 * @param next - Passes req/res to next middleware
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
    payId = urlToPayId(payIdUrl)
  } catch (err) {
    return handleHttpError(HttpStatus.BadRequest, err.message, res, err)
  }

  // This overload isn't mentioned in the express documentation, but if there are no
  // args provided, an array of types sorted by preference is returned
  // https://github.com/jshttp/accepts/blob/master/index.js#L96
  const acceptHeaderTypes = req.accepts()

  if (!acceptHeaderTypes.length) {
    recordPayIdLookupBadAcceptHeader()
    return handleHttpError(
      HttpStatus.BadRequest,
      `Missing Accept header. Must have an Accept header of the form "application/{payment_network}(-{environment})+json".
      Examples:
      - 'Accept: application/xrpl-mainnet+json'
      - 'Accept: application/btc-testnet+json'
      - 'Accept: application/ach+json'
      `,
      res,
    )
  }

  let parsedAcceptTypes: readonly AcceptMediaType[]
  try {
    parsedAcceptTypes = acceptHeaderTypes.map((type) =>
      parseAcceptMediaType(type),
    )
  } catch (error) {
    recordPayIdLookupBadAcceptHeader()

    // TODO:(tkalaw): Should we mention all of the invalid types?
    return handleHttpError(
      HttpStatus.BadRequest,
      `Invalid Accept header. Must be of the form "application/{payment_network}(-{environment})+json".
      Examples:
      - 'Accept: application/xrpl-mainnet+json'
      - 'Accept: application/btc-testnet+json'
      - 'Accept: application/ach+json'
      `,
      res,
      error,
    )
  }

  // TODO: If Accept is just application/json, just return all addresses, for all environments?
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
    addressDetailType: AddressDetailType.CryptoAddress,
    addressDetails: addressInformation.details as CryptoAddressDetails,
  }
  if (addressInformation.payment_network === 'ACH') {
    response = {
      addressDetailType: AddressDetailType.AchAddress,
      addressDetails: addressInformation.details as AchAddressDetails,
    }
  }

  // Store response information (or information to be used in other middlewares)
  // TODO:(hbergren), come up with a less hacky way to pipe around data than global state.
  res.locals.payId = payId
  res.locals.paymentInformation = response
  res.locals.response = response
  recordPayIdLookupResult(
    addressInformation.payment_network,
    addressInformation.environment ?? 'unknown',
    true,
  )
  return next()
}
