import { Request, Response, NextFunction } from 'express'

import { parseReceipt, handleReceipt } from '../services/receipts'
import HttpStatus from '../types/httpStatus'

import handleHttpError from './errors'

export default function receiveReceipt(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const receipt = parseReceipt(req.body)
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */
  if (!receipt) {
    return handleHttpError(
      HttpStatus.BadRequest,
      'Receipt payload is invalid.',
      res,
    )
  }

  try {
    handleReceipt(receipt)
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
