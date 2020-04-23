import PayIDError from './errors'

/**
 * A parsed Accept type
 */
export type AcceptMediaType = {
  // The raw Accept type
  mediaType: string

  // The environment requested by the Accept type
  environment: string

  // The payment network requested by the Accept type
  paymentNetwork: string
}

/**
 * Parses a string mediaType and returns an AcceptType
 * @param mediaType A string representation of an Accept media type to validate
 * @returns A parsed AcceptType
 */
export function parseAcceptMediaType(mediaType: string): AcceptMediaType {
  const ACCEPT_HEADER_REGEX = /^(?:application\/)(?<paymentNetwork>\w+)-?(?<environment>\w+)?(?:\+json)$/
  const regexResult = ACCEPT_HEADER_REGEX.exec(mediaType)
  if (!regexResult || !regexResult.groups) {
    throw new PayIDError(`Invalid Accept media type ${mediaType}`)
  }

  return {
    mediaType,
    environment: (regexResult.groups.environment || '').toUpperCase(),
    paymentNetwork: regexResult.groups.paymentNetwork.toUpperCase(),
  }
}
