import { Request, Response, NextFunction } from 'express'

import generatePaymentSetupDetails from '../services/paymentSetupDetails'
import { wrapMessage } from '../services/signatureWrapper'
import HttpStatus from '../types/httpStatus'
import { MessageType } from '../types/publicAPI'
import { handleHttpError } from '../utils/errors'

/**
 * Parses off the /payment-setup-details path and nonce query parameter from the request URL.
 *
 * @param req - Contains the request URL, which is the PayID + /payment-setup-details + nonce.
 * @param _res - Response used for erroring.
 * @param next - Passes req/res to the next Express middleware.
 *
 * @returns Either the Express next() function or undefined.
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
