import { AddressInformation } from '../types/database'
import { AddressDetailsType, PaymentInformation } from '../types/publicAPI'

import { ParsedAcceptHeader } from './headers'

/**
 * Format AddressInformation into a PaymentInformation object.
 * To be returned in PaymentSetupDetails, or as the response in
 * a Base PayID flow.
 *
 * @param addresses - Array of address information associated with a PayID.
 * @param payId - Optionally include a PayId.
 * @param memoFn - A function, taking an optional PaymentInformation object,
 *                 that returns a string to be used as the memo.
 *
 * @returns The formatted PaymentInformation object.
 */
export function formatPaymentInfo(
  addresses: readonly AddressInformation[],
  payId?: string,
  memoFn?: (paymentInformation: PaymentInformation) => string,
): PaymentInformation {
  const paymentInformation = {
    addresses: addresses.map((address) => {
      return {
        paymentNetwork: address.paymentNetwork,
        ...(address.environment && { environment: address.environment }),
        addressDetailsType: getAddressDetailsType(address),
        addressDetails: address.details,
      }
    }),
    ...(payId && { payId }),
  }

  return {
    ...paymentInformation,
    ...(memoFn?.(paymentInformation) && { memo: memoFn(paymentInformation) }),
  }
}

/**
 * Gets the best payment information associated with a PayID given a set of sorted
 * Accept types and a list of payment information.
 *
 * @param allAddresses - The array of AddressInformation objects to look through.
 * @param sortedParsedAcceptHeaders - An array of ParsedAcceptHeader objects, sorted by preference.
 *
 * @returns An object containing the AcceptMediaType and its associated AddressInformation
 * if one exists; returns undefined otherwise.
 */
export function getPreferredAddressHeaderPair(
  allAddresses: readonly AddressInformation[],
  sortedParsedAcceptHeaders: readonly ParsedAcceptHeader[],
):
  | {
      preferredParsedAcceptHeader: ParsedAcceptHeader
      preferredAddresses: readonly AddressInformation[]
    }
  | undefined {
  if (allAddresses.length === 0) {
    return undefined
  }

  // Find the optimal payment information from a sorted list
  for (const acceptHeader of sortedParsedAcceptHeaders) {
    // Return all addresses for application/payid+json
    if (acceptHeader.paymentNetwork === 'PAYID') {
      return {
        preferredParsedAcceptHeader: acceptHeader,
        preferredAddresses: allAddresses,
      }
    }

    // Otherwise, try to fetch the address for the respective media type
    // foundAddress -> what we have in our database
    // acceptHeader -> what the client sent over
    const paymentInformationForAcceptType = allAddresses.find(
      (foundAddress) =>
        foundAddress.paymentNetwork === acceptHeader.paymentNetwork &&
        // If no environment is found in our database, it returns null
        // If the client doesn't send over an environment, it is undefined
        // Below we convert null to undefined to do the comparison
        (foundAddress.environment ?? undefined) === acceptHeader.environment,
    )

    // Return the address + the media type to respond with
    if (paymentInformationForAcceptType) {
      return {
        preferredParsedAcceptHeader: acceptHeader,
        preferredAddresses: [paymentInformationForAcceptType],
      }
    }
  }

  return undefined
}

// HELPERS

/**
 * Gets the associated AddressDetailsType for an address.
 *
 * @param address - The address information associated with a PayID.
 * @returns The AddressDetailsType for the address.
 */
export function getAddressDetailsType(
  address: AddressInformation,
): AddressDetailsType {
  if (address.paymentNetwork === 'ACH') {
    return AddressDetailsType.FiatAddress
  }
  return AddressDetailsType.CryptoAddress
}
