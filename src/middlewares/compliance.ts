import { Request, Response, NextFunction } from 'express'

import {
  parseComplianceData,
  handleComplianceData,
} from '../services/compliance'

import handleHttpError from './errors'

export default function receiveComplianceData(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const complianceData = parseComplianceData(req.body)
  if (!complianceData) {
    return handleHttpError(400, 'Compliance payload is invalid.', res)
  }
  try {
    handleComplianceData(complianceData)
  } catch (err) {
    return handleHttpError(
      500,
      'Server could not process compliance data.',
      res,
      err,
    )
  }
  res.locals.complianceData = req.body
  return next()
}
