// CONSTANTS
const HTTPS = 'https://'

/**
 * Converts a PayID from [user]$[domain] format representation to a URL representation
 *
 * @param payId - The PayID to convert.
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

  if ((payId.match(/\$/gu) || []).length !== 1) {
    throw new Error('Bad input. PayIDs must include only one $.')
  }

  if ((payId.match(/\//gu) || []).length > 1) {
    throw new Error('Bad input. PayIDs must not have paths.')
  }

  const [user, domain] = payId.split('$')

  if (user === '') {
    throw new Error(
      'Bad input. Missing a user in the format [user]$[domain.com].',
    )
  }

  if (domain === '') {
    throw new Error(
      'Bad input. Missing a domain in the format [user]$[domain.com].',
    )
  }

  return `${HTTPS + domain.toLowerCase()}/${user.toLowerCase()}`
}

/**
 * Converts a PayID from `https://...` representation to `user$...` representation
 *
 * @param url - The url to convert to a PayId.
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

  // Remove https:// from URL
  const removedProtocolUrl = url.substring(HTTPS.length)

  if ((removedProtocolUrl.match(/\//gu) || []).length > 1) {
    /**
     * no namespace paths allowed
     * ex valid:   domain.com/user
     * ex invalid: domain.com/payid/user
     */
    throw new Error(
      'Bad input. The only paths allowed in a PayID are to specify the user.',
    )
  }

  // Split URL into components so we can remove user from end
  const urlComponents = removedProtocolUrl.split('/')
  // Last /path in URL becomes user
  const user = urlComponents[urlComponents.length - 1]
  // Rest of URL is joined back together on '/' returning it to it's normal form
  const urlWithoutUser = urlComponents.slice(0, -1).join('/')
  // User is put first then '$' then rest of the URL
  return `${user.toLowerCase()}$${urlWithoutUser.toLowerCase()}`
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
