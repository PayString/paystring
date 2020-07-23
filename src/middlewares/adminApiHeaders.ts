import { Request, Response, NextFunction } from 'express'

import config, { adminApiVersions } from '../config'
import { ParseError, ParseErrorType, ContentTypeError } from '../utils/errors'

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
export function checkRequestAdminApiVersionHeaders(
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
 * A middleware asserting that Admin requests have an appropriate Content-Type header.
 *
 * @param req - An Express Request object.
 * @param _res - An Express Response object.
 * @param next - An Express next() function.
 * @throws A ParseError if the Content-Type header is missing, malformed, or unsupported.
 */
export function checkRequestContentType(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  type MimeType = 'application/json' | 'application/merge-patch+json'
  // The default media type required is 'application/json' for POST and PUT requests
  let mediaType: MimeType = 'application/json'

  if (req.method === 'PATCH') {
    /**
     * The required Content-Type header for the PATCH endpoints is 'application/merge-patch+json'.
     *
     * The merge patch format is primarily intended for use with the HTTP PATCH method
     * as a means of describing a set of modifications to a target resource’s content.
     * Application/merge-patch+json is a Type Specific Variation of the "application/merge-patch" Media Type that uses a
     * JSON data structure to describe the changes to be made to a target resource.
     */
    mediaType = 'application/merge-patch+json'
  }

  // POST, PUT and PATCH requests need a valid Content-Type header
  if (
    req.header('Content-Type') !== mediaType &&
    ['POST', 'PUT', 'PATCH'].includes(req.method)
  ) {
    throw new ContentTypeError(mediaType)
  }

  next()
}

/**
 * A middleware putting an Accept-Patch header in the response.
 *
 * @param _req - An Express Request object.
 * @param res - An Express Response object.
 * @param next - An Express next() function.
 */
export function addAcceptPatchResponseHeader(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  /**
   * Add this header to the response.
   * Accept-Patch in response to any method means that PATCH is allowed on the resource identified by the Request-URI.
   * The Accept-Patch response HTTP header advertises which media-type the server is able to understand for a PATCH request.
   */
  res.header('Accept-Patch', 'application/merge-patch+json')

  next()
}
