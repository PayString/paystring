import * as Boom from '@hapi/boom'
import HttpStatus from '@xpring-eng/http-status'
import { Response } from 'express'

import logger from '../logger'

/**
 * A helper function for logging errors and sending the HTTP error response.
 *
 * @param errorCode - An HTTP error code.
 * @param msg - The error message.
 * @param res - An Express Response object, for sending the HTTP response.
 * @param err - The associated error object (optional).
 *
 * TODO:(hbergren) Kill this function and put this logic in our errorHandler.
 */
export default function handleHttpError(
  errorCode: number,
  msg: string,
  res: Response,
  err?: Error,
): void {
  // Logging for our debugging purposes
  if (errorCode >= HttpStatus.InternalServerError) {
    logger.error(errorCode, ':', err?.toString() ?? msg)
  } else {
    logger.warn(errorCode, ':', err?.toString() ?? msg)
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

    case HttpStatus.Conflict:
      error = Boom.conflict(msg).output.payload
      break

    case HttpStatus.UnsupportedMediaType:
      error = Boom.unsupportedMediaType(msg).output.payload
      break

    default:
      // This is a 500 internal server error
      error = Boom.badImplementation(msg).output.payload
  }

  res.status(errorCode).json(error)
}
