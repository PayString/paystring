// CONSTANTS
const HTTPS = 'https://'

/**
 * Converts a PayID from `$` representation to `https://` representation
 *
 * @param payId The PayID to convert.
 *
 * @returns A PayID in the https format.
 */
// TODO(hbergren): Move these conversion functions into xpring-common-js and take a dependency on that
// TODO(hbergren): This function is completely unused now. Remove?
export function payIdToUrl(payId: string): string {
  // TODO(hbergren): More validation? (PayID is a semi-valid URL?)
  if (!payId.includes('$')) {
    // TODO(hbergren): Throw a custom error object like we do in xpring-common-js
    throw new Error('Bad input. PayIDs must include a "$"')
  }

  if (!isASCII(payId)) {
    throw new Error('Bad input. PayIDs must be ASCII.')
  }

  // Otherwise, PayId should be in the form `alice$example.com`
  return HTTPS + payId.substring(1)
}

/**
 * Converts a PayID from `https://...` representation to `user$...` representation
 *
 * @param url The url to convert to a PayId.
 *
 * @returns A PayID in the $ format.
 */
export function urlToPayId(url: string): string {
  // TODO:(hbergren) More validation or type-guards?
  if (!url.startsWith(HTTPS)) {
    throw new Error('Bad input. PayID URLs must be HTTPS.')
  }

  if (!isASCII(url)) {
    throw new Error('Bad input. PayIDs must be ASCII.')
  }

  // Otherwise, just replace the https:// string with the $
  return `$${url.substring(HTTPS.length)}`
}

/*
 * HELPER FUNCTIONS
 */

/**
 * Validate if the input is ASCII based text.
 *
 * Shamelessly taken from:
 * https://stackoverflow.com/questions/14313183/javascript-regex-how-do-i-check-if-the-string-is-ascii-only
 *
 * @param input The input to check
 * @returns A boolean indicating the result.
 */
function isASCII(input: string): boolean {
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\x7F]*$/.test(input)
}
