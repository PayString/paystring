import { AddressInformation } from '../types/database'

import { ParseError, ParseErrorType } from './errors'

/**
 * A parsed Accept type.
 */
export interface AcceptMediaType {
  // The raw Accept type
  mediaType: string

  // The environment requested by the Accept type
  environment: string

  // The payment network requested by the Accept type
  paymentNetwork: string
}

/**
 * Parses a string mediaType and returns an AcceptType.
 *
 * @param mediaType - A string representation of an Accept media type to validate.
 * @returns A parsed AcceptType, containing the environment and paymentNetwork.
 */
export function parseAcceptMediaType(mediaType: string): AcceptMediaType {
  const ACCEPT_HEADER_REGEX = /^(?:application\/)(?<paymentNetwork>\w+)-?(?<environment>\w+)?(?:\+json)$/u
  const regexResult = ACCEPT_HEADER_REGEX.exec(mediaType)
  if (!regexResult || !regexResult.groups) {
    throw new ParseError(
      `Invalid Accept media type ${mediaType}`,
      ParseErrorType.InvalidMediaType,
    )
  }

  return {
    mediaType,
    environment: (regexResult.groups.environment || '').toUpperCase(),
    paymentNetwork: regexResult.groups.paymentNetwork.toUpperCase(),
  }
}

/**
 * Given an array of AddressInformation and an sorted array of AcceptMediaTypes,
 * it finds the most suitable AddressInformation to use.
 *
 * @param addressInformations - The array of address information to search through.
 * @param sortedAcceptMediaTypes - An array of AcceptTypes, sorted by preference.
 *
 * @returns An object containing the AcceptMediaType and its associated AddressInformation if one exists;
 *          returns undefined otherwise.
 */
export function getPreferredPaymentInfo(
  addressInformations: readonly AddressInformation[],
  sortedAcceptMediaTypes: readonly AcceptMediaType[],
):
  | {
      acceptType: AcceptMediaType
      addressInformation: AddressInformation
    }
  | undefined {
  for (const acceptType of sortedAcceptMediaTypes) {
    const addressInformationForAcceptType = addressInformations.find(
      (result) =>
        result.paymentNetwork === acceptType.paymentNetwork &&
        (result.environment ?? '') === acceptType.environment,
    )

    if (addressInformationForAcceptType) {
      return {
        acceptType,
        addressInformation: addressInformationForAcceptType,
      }
    }
  }

  return undefined
}
