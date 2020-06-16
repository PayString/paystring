import { ParseError, ParseErrorType } from '../utils/errors'

const badAcceptHeaderErrorMessage = `Must have an Accept header of the form "application/{payment_network}(-{environment})+json".
      Examples:
      - 'Accept: application/xrpl-mainnet+json'
      - 'Accept: application/btc-testnet+json'
      - 'Accept: application/ach+json'
      - 'Accept: application/payid+json'
      `

/** A parsed accept header object. */
export interface ParsedAcceptHeader {
  // A raw media type string
  mediaType: string
  // An environment requested in the media type
  // Optional as some headers (e.g. application/ach+json) don't have an environment
  environment?: string
  // A payment network requested in the media type
  paymentNetwork: string
}

/**
 * Parses a list of accept headers to confirm they adhere to the PayID accept header syntax.
 *
 * @param acceptHeaders - A list of accept headers.
 *
 * @returns A parsed list of accept headers.
 */
// TODO(dino): Generate this error code from a list of supported media types
// TODO(dino): Move the metrics capturing to the error handling middleware
export function parseAcceptHeaders(
  acceptHeaders: string[],
): readonly ParsedAcceptHeader[] {
  // MUST include at least 1 accept header
  if (!acceptHeaders.length) {
    throw new ParseError(
      `Missing Accept Header. ${badAcceptHeaderErrorMessage}`,
      ParseErrorType.InvalidMediaType,
    )
  }

  // Accept types MUST be the proper format
  const parsedAcceptHeaders = acceptHeaders.map((type) =>
    parseAcceptHeader(type),
  )
  return parsedAcceptHeaders
}

// HELPERS

/**
 * Parses an accept header for valid syntax.
 *
 * @param acceptHeader - A string representation of an accept header to validate.
 *
 * @returns A parsed accept header.
 */
export function parseAcceptHeader(acceptHeader: string): ParsedAcceptHeader {
  const ACCEPT_HEADER_REGEX = /^(?:application\/)(?<paymentNetwork>\w+)-?(?<environment>\w+)?(?:\+json)$/u
  const lowerCaseMediaType = acceptHeader.toLowerCase()
  const regexResult = ACCEPT_HEADER_REGEX.exec(lowerCaseMediaType)
  if (!regexResult || !regexResult.groups) {
    throw new ParseError(
      `Invalid Accept Header. ${badAcceptHeaderErrorMessage}`,
      ParseErrorType.InvalidMediaType,
    )
  }

  return {
    mediaType: lowerCaseMediaType,
    // Optionally returns the environment (only if it exists)
    ...(regexResult.groups.environment && {
      environment: regexResult.groups.environment.toUpperCase(),
    }),
    paymentNetwork: regexResult.groups.paymentNetwork.toUpperCase(),
  }
}
