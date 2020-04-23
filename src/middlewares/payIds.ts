import { Request, Response, NextFunction } from 'express'

import getPaymentInfoFromDatabase from '../data-access/payIds'
import { urlToPayId } from '../services/utils'
import HttpStatus from '../types/httpStatus'
import {
  PaymentInformation,
  AddressDetailType,
  CryptoAddressDetails,
  AchAddressDetails,
} from '../types/publicAPI'
import { AcceptMediaType, parseAcceptMediaType } from '../utils/acceptHeader'

import handleHttpError from './errors'

/**
 * Resolves inbound requests to a PayID to their
 * respective ledger addresses or other payment information required.
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
  /**
   * NOTE: if you plan to expose your PayID with a port number, you
   * should use:
   *  const payIdUrl =
   *  `${req.protocol}://${req.hostname}:${Config.publicAPIPort}${req.url}`
   */
  // TODO(aking): stop hardcoding HTTPS. We should at minimum be using ${req.protocol}
  // TODO:(hbergren) Write a helper function for this and test it?
  const payIdUrl = `https://${req.hostname}${req.url}`
  let payId: string
  try {
    payId = urlToPayId(payIdUrl)
  } catch (err) {
    return handleHttpError(HttpStatus.BadRequest, err.message, res, err)
  }

  // This overload isn't mentioned in the express documentation, but if there are no
  // args provided, an array of types sorted by preference is returned
  // https://github.com/jshttp/accepts/blob/master/index.js#L96
  const acceptHeaderTypes = req.accepts()

  if (!acceptHeaderTypes.length) {
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

  let parsedAcceptMediaTypes: AcceptMediaType[] = []
  try {
    parsedAcceptMediaTypes = acceptHeaderTypes.map(parseAcceptMediaType)
  } catch (error) {
    return handleHttpError(
      HttpStatus.BadRequest,
      `Invalid Accept header. Must be of the form "application/{payment_network}(-{environment})+json".
      Examples:
      - 'Accept: application/xrpl-mainnet+json'
      - 'Accept: application/btc-testnet+json'
      - 'Accept: application/ach+json'
      `,
      res,
    )
  }

  const { paymentNetwork, environment, mediaType } = parsedAcceptMediaTypes[0]

  // TODO(tedkalaw): Remove this after content negotiation is in
  if (parsedAcceptMediaTypes.length > 1) {
    return handleHttpError(
      400,
      `Invalid Accept header. Must be of the form "application/{payment_network}(-{environment})+json".
      Examples:
      - 'Accept: application/xrpl-mainnet+json'
      - 'Accept: application/btc-testnet+json'
      - 'Accept: application/ach+json'
      `,
      res,
    )
  }

  // TODO: If Accept is just application/json, just return all addresses, for all environments?
  // Get the paymentInformation from the database
  const paymentInformation = await getPaymentInfoFromDatabase(
    payId,
    paymentNetwork,
    environment,
  )

  // TODO:(hbergren) Distinguish between missing PayID in system, and missing address for paymentNetwork/environment.
  // Or is `application/json` the appropriate response Content-Type?
  if (paymentInformation === undefined) {
    return handleHttpError(
      HttpStatus.NotFound,
      `Payment information for ${payId} in ${paymentNetwork} on ${environment} could not be found.`,
      res,
    )
  }

  // TODO:(hbergren) See what happens if you pass multiple accept headers with different quality ratings.
  // Set the content-type to the media type corresponding to the returned address
  res.set('Content-Type', mediaType)

  // TODO:(hbergren) Create a helper function for this?
  let response: PaymentInformation = {
    addressDetailType: AddressDetailType.CryptoAddress,
    addressDetails: paymentInformation.details as CryptoAddressDetails,
  }
  if (paymentNetwork === 'ACH') {
    response = {
      addressDetailType: AddressDetailType.AchAddress,
      addressDetails: paymentInformation.details as AchAddressDetails,
    }
  }

  // Store response information (or information to be used in other middlewares)
  // TODO:(hbergren), come up with a less hacky way to pipe around data than global state.
  res.locals.payId = payId
  res.locals.paymentInformation = response
  res.locals.response = response

  return next()
}
