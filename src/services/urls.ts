import { ParseError, ParseErrorType } from '../utils/errors'

/**
 * Gets the full URL from request components. To be used to create the PayID.
 *
 * @param protocol - The URL protocol (http(s)).
 * @param hostname - Used to create the host in the PayID (user$host).
 * @param path - Used to create the "user" in the PayID (user$host).
 * @param port - Used in the PayID if included (optional).
 *
 * @returns A constructed URL.
 */
export function constructUrl(
  protocol: string,
  hostname: string,
  path: string,
  port?: string,
): string {
  if (port) {
    return `${protocol}://${hostname}:${port}${path}`
  }
  return `${protocol}://${hostname}${path}`
}

/**
 * Converts a PayID from `https://...` URL representation to `user$...` representation.
 *
 * @param url - The url string to convert to a PayId.
 *
 * @returns A PayID in the $ format.
 */
export function urlToPayId(url: string): string {
  // Parse the URL and get back a valid PayID URL
  const payIdUrl = parsePayIdUrl(url)

  // Get the user from the pathname
  const user = payIdUrl.pathname.slice(1)

  // use .host instead of .hostname to return the port if applicable
  return `${user.toLowerCase()}$${payIdUrl.host}`
}

// HELPER FUNCTIONS

/**
 * Validate if the input is ASCII based text.
 *
 * Shamelessly taken from: https://stackoverflow.com/questions/14313183/javascript-regex-how-do-i-check-if-the-string-is-ascii-only.
 *
 * @param input - The string to verify.
 * @returns A boolean indicating whether or not the string is ASCII.
 */
function isASCII(input: string): boolean {
  // eslint-disable-next-line no-control-regex -- Regex for checking if ASCII uses control characters
  return /^[\x00-\x7F]*$/u.test(input)
}

/**
 * Parse the URL to see if it can be converted to a PayID.
 *
 * @param url - The URL string to be converted to a PayID URL.
 *
 * @returns A URL object.
 *
 * @throws A custom ParseError when the PayID URL is invalid.
 */
function parsePayIdUrl(url: string): URL {
  // Make sure it's not something wild like an FTP request
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new ParseError(
      'Invalid PayID URL protocol. PayID URLs must be HTTP/HTTPS.',
      ParseErrorType.InvalidPayId,
    )
  }

  if (!isASCII(url)) {
    throw new ParseError(
      'Invalid PayID characters. PayIDs must be ASCII.',
      ParseErrorType.InvalidPayId,
    )
  }

  // Verify it's a valid URL
  const parsedUrl = new URL(url)

  // Disallow namespace paths
  // Valid:   domain.com/user
  // Invalid: domain.com/payid/user
  if ((parsedUrl.pathname.match(/\//gu) || []).length > 1) {
    throw new ParseError(
      'Too many paths. The only paths allowed in a PayID are to specify the user.',
      ParseErrorType.InvalidPayId,
    )
  }

  return parsedUrl
}
