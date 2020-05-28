import { Request, Response, NextFunction, RequestHandler } from 'express'

import HttpStatus from '../types/httpStatus'
import { PayIDError, handleHttpError } from '../utils/errors'

export default function errorHandler(
  err: Error | PayIDError,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  // https://expressjs.com/en/guide/error-handling.html
  // If you call next() with an error after you have started writing the response,
  // (for example, if you encounter an error while streaming the response to the client),
  // the Express default error handler closes the connection and fails the request.
  // So, when you add a custom error handler,
  // you must delegate to the default Express error handler when the headers have already been sent to the client.
  if (res.headersSent) {
    return next(err)
  }

  let status = HttpStatus.InternalServerError
  if (err instanceof PayIDError) {
    status = err.httpStatusCode
  }

  return handleHttpError(status, err.message, res, err)
}

// Needed to make Express handle errors raised by async middlewares
export function wrapAsync(handler: RequestHandler): RequestHandler {
  // Catch async errors and pass them along to our custom error handler.
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => Promise.resolve(handler(req, res, next)).catch(next)
}
