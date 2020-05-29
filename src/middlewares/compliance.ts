import { Request, Response, NextFunction } from 'express'

import {
  parseComplianceData,
  handleComplianceData,
} from '../services/compliance'
import HttpStatus from '../types/httpStatus'
import { handleHttpError } from '../utils/errors'

export default function receiveComplianceData(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const complianceData = parseComplianceData(req.body)
  /* eslint-disable @typescript-eslint/no-unnecessary-condition --
   * TODO:(@dino-rodriguez): This should be refactored to be in parseComplianceData
   */
  if (!complianceData) {
    return handleHttpError(
      HttpStatus.BadRequest,
      'Compliance payload is invalid.',
      res,
    )
  }
  /* eslint-enable @typescript-eslint/no-unnecessary-condition */
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
