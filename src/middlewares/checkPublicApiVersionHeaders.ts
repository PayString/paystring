import { Request, Response, NextFunction } from 'express'
import * as semver from 'semver'

import config, { payIdServerVersions } from '../config'
import { ParseError, ParseErrorType } from '../utils/errors'

/**
 * A middleware asserting that all public API HTTP requests have an appropriate PayID-Version header.
 *
 * It also sets a PayID-Server-Version header on all public API responses to allow for PayID Protocol version negotiation.
 *
 * @param req - An Express Request object.
 * @param res - An Express Response object.
 * @param next - An Express next() function.
 *
 * @throws A ParseError if the PayID-Version header is missing, malformed, or unsupported.
 */
export default function checkPublicApiVersionHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Add our PayID-Server-Version header to all successful responses.
  // This should be the most recent version of the PayID protocol this server knows how to handle.
  // We add it early so even errors will respond with the `PayID-Server-Version` header.
  res.header('PayID-Server-Version', config.app.payIdVersion)

  const payIdVersionHeader = req.header('PayID-Version')

  // Checks if the PayID-Version header exists
  if (!payIdVersionHeader) {
    throw new ParseError(
      "A PayID-Version header is required in the request, of the form 'PayID-Version: {major}.{minor}'.",
      ParseErrorType.MissingPayIdVersionHeader,
    )
  }

  // Regex only includes major and minor because we ignore patch.
  const semverRegex = /^\d+\.\d+$/u
  const regexResult = semverRegex.exec(payIdVersionHeader)
  if (!regexResult) {
    throw new ParseError(
      "A PayID-Version header must be in the form 'PayID-Version: {major}.{minor}'.",
      ParseErrorType.InvalidPayIdVersionHeader,
    )
  }

  // Because payIdServerVersion is a constant from config,
  // and we have the regex check on the payIdRequestVersion,
  // both of these semver.coerce() calls are guaranteed to succeed.
  // But we need to cast them because TypeScript doesn't realize that.
  const payIdRequestVersion = semver.coerce(payIdVersionHeader) as semver.SemVer
  const payIdServerVersion = semver.coerce(
    config.app.payIdVersion,
  ) as semver.SemVer

  if (semver.gt(payIdRequestVersion, payIdServerVersion)) {
    throw new ParseError(
      `The PayID-Version ${payIdVersionHeader} is not supported, please try downgrading your request to PayID-Version ${config.app.payIdVersion}`,
      ParseErrorType.UnsupportedPayIdVersionHeader,
    )
  }

  if (!payIdServerVersions.includes(payIdVersionHeader)) {
    throw new ParseError(
      `The PayID Version ${payIdVersionHeader} is not supported, try something in the range ${
        payIdServerVersions[0]
      } - ${payIdServerVersions[payIdServerVersions.length - 1]}`,
      ParseErrorType.UnsupportedPayIdVersionHeader,
    )
  }

  // Add our PayID-Version header to all responses.
  // Eventually, we'll need to be able to upgrade/downgrade responses.
  res.header('PayID-Version', payIdVersionHeader)

  // TODO:(hbergren) This probably should not live here.
  // We probably want a separate setHeaders() function that does the setting,
  // and this and the PayID-Version header can live there.
  //
  // The response may not be stored in any cache.
  // Although other directives may be set,
  // this alone is the only directive you need in preventing cached responses on modern browsers
  res.header('Cache-Control', 'no-store')

  next()
}
