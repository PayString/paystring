import { Request, Response, NextFunction } from 'express'

import { parseReceipt, handleReceipt } from '../services/receipts'

import handleHttpError from './errors'

export default function receiveReceipt(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const receipt = parseReceipt(req.body)
  if (!receipt) {
    return handleHttpError(400, 'Receipt payload is invalid.', res)
  }

  try {
    handleReceipt(receipt)
  } catch (err) {
    handleHttpError(500, 'Server could not process receipt', res, err)
  }

  return next()
}
