import { Request, Response, NextFunction } from 'express'

import config, { adminApiVersions } from '../config'
import { ParseError, ParseErrorType } from '../utils/errors'

/**
 * A middleware asserting that all Admin API HTTP requests have an appropriate PayID-API-Version header.
 *
 * It also sets version headers on all Admin API HTTP responses for informational purposes.
 *
 * @param req - An Express Request object.
 * @param res - An Express Response object.
 * @param next - An Express next() function.
 *
 * @throws A ParseError if the PayID-API-Version header is missing, malformed, or unsupported.
 */
export default function checkAdminApiVersionHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Add our Server-Version headers to all successful responses.
  // This should be the most recent version of the PayID protocol / PayID Admin API this server knows how to handle.
  // We add it early so even errors will respond with Server-Version headers.
  res.header('PayID-Server-Version', config.app.payIdVersion)
  // TODO:(hbergren) Rename this to PayID-Admin-Server-Version
  res.header('PayID-API-Server-Version', config.app.adminApiVersion)

  // TODO:(hbergren) Rename this to PayID-Admin-API-Version
  const payIdApiVersionHeader = req.header('PayID-API-Version')

  // Checks if the PayID-API-Version header exists
  if (!payIdApiVersionHeader) {
    throw new ParseError(
      "A PayID-API-Version header is required in the request, of the form 'PayID-API-Version: YYYY-MM-DD'.",
      ParseErrorType.MissingPayIdApiVersionHeader,
    )
  }

  const dateRegex = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/u
  const regexResult = dateRegex.exec(payIdApiVersionHeader)
  if (!regexResult) {
    throw new ParseError(
      "A PayID-API-Version header must be in the form 'PayID-API-Version: YYYY-MM-DD'.",
      ParseErrorType.InvalidPayIdApiVersionHeader,
    )
  }

  // Because they are ISO8601 date strings, we can just do a string comparison
  if (payIdApiVersionHeader < adminApiVersions[0]) {
    throw new ParseError(
      `The PayID-API-Version ${payIdApiVersionHeader} is not supported, please try upgrading your request to at least 'PayID-API-Version: ${adminApiVersions[0]}'`,
      ParseErrorType.UnsupportedPayIdApiVersionHeader,
    )
  }

  next()
}
