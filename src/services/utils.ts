import config from '../config'

// CONSTANTS
const HTTPS = 'https://'
const HTTP = 'http://'

/**
 * Gets the full URL from request components. To be used to create the PayID.
 *
 * @param protocol - HTTPS/HTTP
 * @param hostname - Used to create the host in the PayID (user$host)
 * @param path - Used to create the "user" in the PayID (user$host)
 * @param port - Maybe used in the PayID, if included
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
 * Converts a PayID from `https://...` representation to `user$...` representation
 *
 * @param url - The url string to convert to a PayId.
 * @param httpsRequired - Indicates if we only support URLs with HTTPS.
 *
 * @returns A PayID in the $ format.
 */
export function urlToPayId(
  url: string,
  httpsRequired = config.app.httpsRequired,
): string {
  // Parse the URL and get back a valid PayID URL
  const payIdUrl = parsePayIdUrl(url, httpsRequired)

  // Get the user from the pathname
  const user = payIdUrl.pathname.slice(1)

  // use .host instead of .hostname to return the port if applicable
  return `${user.toLowerCase()}$${payIdUrl.host}`
}

// HELPER FUNCTIONS

/**
 * Validate if the input is ASCII based text.
 *
 * Shamelessly taken from:
 * https://stackoverflow.com/questions/14313183/javascript-regex-how-do-i-check-if-the-string-is-ascii-only
 *
 * @param input - The input to check
 * @returns A boolean indicating the result.
 */
function isASCII(input: string): boolean {
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\x7F]*$/u.test(input)
}

/**
 * Parse the URL to see if it can be converted to a PayID.
 *
 * @param url - The URL string to be converted to a PayID URL.
 * @param httpsRequired - Indicates if we only support URLs with HTTPS.
 *
 * @returns A URL object.
 */
function parsePayIdUrl(url: string, httpsRequired: boolean): URL {
  if (!url.startsWith(HTTPS) && httpsRequired) {
    throw new Error('Bad input. PayID URLs must be HTTPS.')
  }

  if (!url.startsWith(HTTPS) && !url.startsWith(HTTP)) {
    throw new Error('Bad input. PayID URLs must be HTTP/HTTPS.')
  }

  if (!isASCII(url)) {
    throw new Error('Bad input. PayIDs must be ASCII.')
  }

  // Verify it's a valid URL
  const parsedUrl = new URL(url)

  // Disallow namespace paths
  // Valid:   domain.com/user
  // Invalid: domain.com/payid/user
  if ((parsedUrl.pathname.match(/\//gu) || []).length > 1) {
    throw new Error(
      'Bad input. The only paths allowed in a PayID are to specify the user.',
    )
  }

  return parsedUrl
}
