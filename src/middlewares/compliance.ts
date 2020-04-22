import { Request, Response, NextFunction } from 'express'

import {
  parseComplianceData,
  handleComplianceData,
} from '../services/compliance'
import HttpStatus from '../types/httpStatus'

import handleHttpError from './errors'

export default function receiveComplianceData(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const complianceData = parseComplianceData(req.body)
  if (!complianceData) {
    return handleHttpError(
      HttpStatus.BadRequest,
      'Compliance payload is invalid.',
      res,
    )
  }
  try {
    handleComplianceData(complianceData)
  } catch (err) {
    return handleHttpError(
      HttpStatus.InternalServerError,
      'Server could not process compliance data.',
      res,
      err,
    )
  }
  res.locals.complianceData = req.body
  return next()
}
