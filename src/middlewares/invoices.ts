import { Request, Response, NextFunction } from 'express'

import generateInvoice from '../services/invoices'
import { wrapMessage } from '../services/signatureWrapper'
import { MessageType } from '../types/publicAPI'

import handleHttpError from './errors'

/**
 * Parses off the /invoice path and nonce query parameter from the request URL.
 *
 * @param req - Contains request URL, which is the PayID + /invoice + nonce
 * @param res - Used for erroring on missing nonce
 * @param next - Passes req/res to next middleware
 */
export function parseInvoicePath(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const pathToStrip = '/invoice'
  if (!req.query.nonce) {
    return handleHttpError(400, 'Missing nonce query parameter.', res)
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
    return handleHttpError(500, 'Server could not generate invoice.', res, err)
  }
  res.locals.response = wrapMessage(invoice, MessageType.Invoice)
  return next()
}
