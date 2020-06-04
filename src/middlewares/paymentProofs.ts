import { Request, Response, NextFunction } from 'express'

import {
  parsePaymentProof,
  handlePaymentProof,
} from '../services/paymentProofs'
import HttpStatus from '../types/httpStatus'
import { handleHttpError } from '../utils/errors'

/**
 * An Express middleware used to handle POST requests with PaymentProofs to the /payment-proofs endpoint.
 *
 * @param req - An Express Request object, holding the PaymentProof in the request body.
 * @param res - An Express Response object, used for error handling.
 * @param next - An Express next() function.
 *
 * @returns The Express next function provided, to call the next middleware in the pipeline.
 */
export default function receivePaymentProof(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const paymentProof = parsePaymentProof(req.body)
  /* eslint-disable @typescript-eslint/no-unnecessary-condition --
   * TODO:(@dino-rodriguez): This should be refactored to be in parseComplianceData
   */
  if (!paymentProof) {
    return handleHttpError(
      HttpStatus.BadRequest,
      'Payment proof payload is invalid.',
      res,
    )
  }
  /* eslint-enable @typescript-eslint/no-unnecessary-condition */

  try {
    handlePaymentProof(paymentProof)
  } catch (err) {
    handleHttpError(
      HttpStatus.InternalServerError,
      'Server could not process receipt',
      res,
      err,
    )
  }

  return next()
}
