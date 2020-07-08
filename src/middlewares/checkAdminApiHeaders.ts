import { Request, Response, NextFunction } from 'express'

import config, { adminApiVersions } from '../config'
import {
  ParseError,
  ParseErrorType,
  HeaderError,
  HeaderErrorType,
} from '../utils/errors'

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
export function checkAdminApiVersionHeaders(
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

/**
 * A middleware asserting that all Admin PATCH API HTTP requests have an appropriate Content-Type header.
 *
 * @param req - An Express Request object.
 * @param res - An Express Response object.
 * @param next - An Express next() function.
 *
 * @throws A ParseError if the Content-Type header is missing, malformed, or unsupported.
 */
export function checkAdminApiPatchHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // The merge patch format is primarily intended for use with the HTTP PATCH method
  // as a means of describing a set of modifications to a target resource’s content.
  // application/merge-patch+json is a Type Specific Variation of the "application/merge-patch" Media Type that uses a
  // JSON data structure to describe the changes to be made to a target resource.
  const patchContentType = 'application/merge-patch+json'

  // Add this header to all successful responses. We add it early so even errors will respond with Accept-Patch header.
  // The Accept-Patch response HTTP header advertises which media-type the server
  // is able to understand while receiving a PATCH request.
  res.header('Accept-Patch', patchContentType)

  if (req.header('Content-Type') !== patchContentType) {
    throw new HeaderError(
      `A specific 'Content-Type' header is required for a PATCH request: 'Content-Type: ${patchContentType}'.`,
      HeaderErrorType.UnsupportedMediaTypeHeader,
    )
  }

  next()
}
