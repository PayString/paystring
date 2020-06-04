import { Request, Response, NextFunction } from 'express'

import generatePaymentSetupDetails from '../services/paymentSetupDetails'
import { wrapMessage } from '../services/signatureWrapper'
import HttpStatus from '../types/httpStatus'
import { MessageType } from '../types/publicAPI'
import { handleHttpError } from '../utils/errors'

/**
 * Parses off the /payment-setup-details path and nonce query parameter from the request URL.
 *
 * @param req - An Express Request object.
 *              Contains the request URL, which is the PayID + /payment-setup-details + nonce.
 * @param _res - An Express Response object (unused).
 * @param next - An Express next() function.
 *
 * @returns The Express next() function, to trigger the next middleware in the pipeline.
 */
export function parsePaymentSetupDetailsPath(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const pathToStrip = '/payment-setup-details'

  req.url = req.path.slice(0, req.path.length - pathToStrip.length)

  return next()
}

/**
 * A middleware to handle a GET /payment-setup-details request.
 * Generates the PaymentSetupDetails object and wraps it in a SignatureWrapper.
 *
 * @param _req - An Express Request object (unused).
 * @param res - An Express Response object. Holds (payId, paymentInformation, complianceData) on res.locals.
 *              Also used for setting the eventual response for a GET /payment-setup-details.
 * @param next - An Express next() function.
 *
 * @returns An Express next() function, to trigger the next middleware in the pipeline.
 */
export default function getPaymentSetupDetails(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  let paymentSetupDetails
  try {
    paymentSetupDetails = generatePaymentSetupDetails(
      res.locals.payId,
      res.locals.paymentInformation,
      res.locals.complianceData,
    )
  } catch (err) {
    return handleHttpError(
      HttpStatus.InternalServerError,
      'Server could not generate PaymentSetupDetails.',
      res,
      err,
    )
  }
  res.locals.response = wrapMessage(
    paymentSetupDetails,
    MessageType.PaymentSetupDetails,
  )
  return next()
}
