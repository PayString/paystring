import { Request, Response, NextFunction } from 'express'

import generateInvoice from '../services/invoices'
import { wrapMessage } from '../services/signatureWrapper'
import HttpStatus from '../types/httpStatus'
import { MessageType } from '../types/publicAPI'
import { handleHttpError } from '../utils/errors'

/**
 * Parses off the /invoice path and nonce query parameter from the request URL.
 *
 * @param req - Contains the request URL, which is the PayID + /invoice + nonce.
 * @param res - Response used for erroring on a missing nonce.
 * @param next - Passes req/res to the next Express middleware.
 *
 * @returns Either the Express next() function or undefined.
 */
export function parseInvoicePath(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const pathToStrip = '/invoice'
  if (!req.query.nonce) {
    return handleHttpError(
      HttpStatus.BadRequest,
      'Missing nonce query parameter.',
      res,
    )
  }
  req.url = req.path.slice(0, req.path.length - pathToStrip.length)

  res.locals.nonce = req.query.nonce
  return next()
}

export default function getInvoice(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  let invoice
  try {
    invoice = generateInvoice(
      res.locals.nonce,
      res.locals.payId,
      res.locals.paymentInformation,
      res.locals.complianceData,
    )
  } catch (err) {
    return handleHttpError(
      HttpStatus.InternalServerError,
      'Server could not generate invoice.',
      res,
      err,
    )
  }
  res.locals.response = wrapMessage(invoice, MessageType.Invoice)
  return next()
}
