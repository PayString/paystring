import { Request, Response, NextFunction } from 'express'

import getPaymentInfoFromDatabase from '../services/payIds'
import { urlToPaymentPointer } from '../services/utils'
import {
  PaymentInformation,
  AddressDetailType,
  CryptoAddressDetails,
  AchAddressDetails,
} from '../types/publicAPI'

import handleHttpError from './errors'

/**
 * Resolves inbound requests to a payment pointer to their
 * respective ledger addresses or other payment information required.
 *
 * @param req Contains payment pointer and payment network header
 * @param res Stores payment information to be returned to the client
 * @param next Passses req/res to next middleware
 */
export default async function getPaymentInfo(
  req: Request,
  res: Response,
  next: NextFunction,
  // TODO:(hbergren) Why is this passed in? Do we use this parameter anywhere?
  // Or is this just us doing Dependency Injection?
  getPaymentInfoFromPaymentPointer = getPaymentInfoFromDatabase,
): Promise<void> {
  /**
   * NOTE: if you plan to expose your payment pointer with a port number, you
   * should use:
   *  const paymentPointerUrl =
   *  `${req.protocol}://${req.hostname}:${Config.publicAPIPort}${req.url}`
   */
  // TODO(aking): stop hardcoding HTTPS. We should at minimum be using ${req.protocol}
  // TODO:(hbergren) Write a helper function for this and test it?
  const paymentPointerUrl = `https://${req.hostname}${req.url}`
  let paymentPointer: string
  try {
    paymentPointer = urlToPaymentPointer(paymentPointerUrl)
  } catch (err) {
    return handleHttpError(400, err.message, res, err)
  }

  // TODO:(hbergren) Refactor this parsing to a static method or even a utils class.
  // If you do that, then you can easily unit test this bit of logic. You can then change out the implementation of the method easily since it will be encapsulated.
  const ACCEPT_HEADER_REGEX = /^(?:application\/)(?<paymentNetwork>\w+)-?(?<environment>\w+)?(?:\+json)$/
  const validatedAcceptHeader = ACCEPT_HEADER_REGEX.exec(
    req.get('Accept') || '',
  )

  if (!validatedAcceptHeader) {
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

  const [acceptHeader, paymentNetwork, environment] = validatedAcceptHeader.map(
    (elem) => {
      // Our DB stores paymentNetwork and environment in all uppercase
      return elem?.toUpperCase()
    },
  )

  // TODO: If Accept is just application/json, just return all addresses, for all environments?
  // Get the paymentInformation from the database
  const paymentInformation = await getPaymentInfoFromPaymentPointer(
    paymentPointer,
    paymentNetwork,
    environment,
  )

  // TODO:(hbergren) Distinguish between missing payment pointer in system, and missing address for paymentNetwork/environment.
  if (paymentInformation === undefined) {
    return handleHttpError(
      404,
      `Payment information for ${paymentPointer} in ${paymentNetwork} on ${environment} could not be found.`,
      res,
    )
  }

  // TODO:(hbergren) See what happens if you pass multiple accept headers with different quality ratings.
  res.set('Content-Type', acceptHeader)

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

  // store response information (or information to be used in other middlewares)
// TODO:(hbergren), come up with a less hacky way to pipe around data than global state.
  res.locals.payId = paymentPointer
  res.locals.paymentInformation = response
  res.locals.response = response

  return next()
}
