/* eslint-disable @typescript-eslint/no-use-before-define */

// CONSTANTS
const HTTPS = 'https://'
const WELL_KNOWN = '/.well-known/pay'

/**
 * Converts a Payment Pointer from `$` representation to `https://` representation
 *
 * @param paymentPointer The payment pointer to convert.
 *
 * @returns A payment pointer in the https format.
 */
export function paymentPointerToUrl(paymentPointer: string): string {
  // TODO(hbergren): More validation? (Payment pointer is a semi-valid URL?)
  if (!paymentPointer.startsWith('$')) {
    throw new Error('Bad input. Payment pointers must start with "$"')
  }

  if (!isASCII(paymentPointer)) {
    throw new Error('Bad input. Payment pointers must be ASCII.')
  }

  // If the payment pointer is in the form `$example.com` or `$example.com/`
  const paths = paymentPointer.split('/')
  if (paths[1] === undefined || paths[1].length === 0) {
    return HTTPS + paths[0].substring(1) + WELL_KNOWN
  }

  // Otherwise, payment pointer should be in the form `$example.com/hbergren`
  return HTTPS + paymentPointer.substring(1)
}

/**
 * Converts a Payment Pointer from `https://...` representation to `$...` representation
 *
 * @param url The url to convert to a payment pointer.
 *
 * @returns A payment pointer in the $ format.
 */
export function urlToPaymentPointer(url: string): string {
  // TODO:(hbergren) More validation or type-guards?
  if (!url.startsWith(HTTPS)) {
    throw new Error('Bad input. Payment pointer URLs must be HTTPS.')
  }

  if (!isASCII(url)) {
    throw new Error('Bad input. Payment pointers must be ASCII.')
  }

  // If the URL is of the form `https://{url}/.well-known/pay`, return `${url}`
  if (url.endsWith(WELL_KNOWN)) {
    return `$${url.slice(HTTPS.length, -WELL_KNOWN.length)}`
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
