import * as Boom from 'boom'
import { Response } from 'express'

import HttpStatus from '../types/httpStatus'
import logger from '../utils/logger'

export default function handleHttpError(
  errorCode: number,
  msg: string,
  res: Response,
  err?: Error,
): void {
  // Logging for our debugging purposes
  if (errorCode >= HttpStatus.InternalServerError) {
    logger.error(errorCode, ':', msg, err)
  } else {
    logger.warn(errorCode, ':', msg)
  }

  // Error code matching
  let error: Boom.Payload
  switch (errorCode) {
    case HttpStatus.BadRequest:
      error = Boom.badRequest(msg).output.payload
      break

    case HttpStatus.NotFound:
      error = Boom.notFound(msg).output.payload
      break

    default:
      // This is a 500 internal server error
      error = Boom.badImplementation(msg).output.payload
  }

  res.status(errorCode).json(error)
}
