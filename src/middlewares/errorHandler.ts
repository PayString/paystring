import HttpStatus from '@xpring-eng/http-status'
import { Request, Response, NextFunction, RequestHandler } from 'express'

import metrics from '../services/metrics'
import { PayIDError, handleHttpError, ParseErrorType } from '../utils/errors'

/**
 * An error handling middleware responsible for catching unhandled errors,
 * and sending out an appropriate HTTP error response.
 *
 * @param err - An uncaught error to be handled by our error handler.
 * @param _req - An Express Request object (unused).
 * @param res - An Express Response object.
 * @param next - An Express next() function. Used for delegating to the default error handler.
 *
 * @returns Nothing.
 */
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
  //
  // So, when you add a custom error handler,
  // you must delegate to the default Express error handler when the headers have already been sent to the client.
  if (res.headersSent) {
    return next(err)
  }

  let status = HttpStatus.InternalServerError
  if (err instanceof PayIDError) {
    status = err.httpStatusCode

    // Collect metrics on public API requests with bad Accept headers
    if (err.kind === ParseErrorType.InvalidMediaType) {
      metrics.recordPayIdLookupBadAcceptHeader()
    }
  }

  return handleHttpError(status, err.message, res, err)
}

/**
 * A function used to wrap asynchronous Express middlewares.
 * It catches async errors so Express can pass them to an error handling middleware.
 *
 * @param handler - An Express middleware function.
 *
 * @returns An Express middleware capable of catching asynchronous errors.
 */
export function wrapAsync(handler: RequestHandler): RequestHandler {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => Promise.resolve(handler(req, res, next)).catch(next)
}
