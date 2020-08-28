import { adminApiVersions } from '../config'
import { AddressInformation } from '../types/database'
import {
  Address,
  VerifiedAddress,
  VerifiedAddressSignature,
} from '../types/protocol'
import { ParseError, ParseErrorType } from '../utils/errors'

/**
 * Parse all addresses depending on the Admin API version and format them properly
 * so they can be consumed by the database.
 *
 * @param maybeAddresses - An array of addresses ( in either the old or new format ) or undefined.
 * @param maybeVerifiedAddresses - An array of verified addresses ( in either the old or new format ) or undefined.
 * @param maybeIdentityKey - An identity key or undefined ( included with verified addresses ).
 * @param requestVersion - The request version to determine how to parse the addresses.
 *
 * @returns A tuple of all the formatted addresses & the identity key.
 */
export default function parseAllAddresses(
  maybeAddresses: Address[] | AddressInformation[] | undefined,
  maybeVerifiedAddresses: VerifiedAddress[] | AddressInformation[] | undefined,
  maybeIdentityKey: string | undefined,
  requestVersion: string,
): [AddressInformation[], string | undefined] {
  const addresses = maybeAddresses ?? []
  const verifiedAddresses = maybeVerifiedAddresses ?? []
  let allAddresses: AddressInformation[] = []

  // If using "old" API format, we don't need to do any translation
  if (requestVersion < adminApiVersions[1]) {
    allAddresses = allAddresses.concat(
      addresses as AddressInformation[],
      verifiedAddresses as AddressInformation[],
    )
  }
  // If using Public API format, we need to translate the payload so
  // the data-access functions can consume them
  else if (requestVersion >= adminApiVersions[1]) {
    const formattedAddresses = (addresses as Address[]).map(
      (address: Address) => {
        return {
          paymentNetwork: address.paymentNetwork,
          ...(address.environment && { environment: address.environment }),
          details: address.addressDetails,
        }
      },
    )
    const formattedVerifiedAddressesAndKey = parseVerifiedAddresses(
      verifiedAddresses as VerifiedAddress[],
    )
    allAddresses = allAddresses.concat(
      formattedAddresses,
      formattedVerifiedAddressesAndKey[0],
    )
    return [allAddresses, formattedVerifiedAddressesAndKey[1]]
  }

  return [allAddresses, maybeIdentityKey]
}

// HELPERS

/**
 * Parse all verified addresses to confirm they use a single identity key &
 * return parsed output that can be inserted into the database.
 *
 * @param verifiedAddresses - Array of verified addresses that adheres the the Public API format.
 *
 * @returns Array of address inforation to be consumed by insertUser.
 */
function parseVerifiedAddresses(
  verifiedAddresses: VerifiedAddress[],
): [AddressInformation[], string | undefined] {
  const identityKeyLabel = 'identityKey'
  const formattedAddresses: AddressInformation[] = []
  let identityKey: string | undefined

  verifiedAddresses.forEach((verifiedAddress: VerifiedAddress) => {
    let identityKeySignature: string | undefined
    let identityKeyCount = 0

    verifiedAddress.signatures.forEach(
      (signaturePayload: VerifiedAddressSignature) => {
        let decodedKey: { name: string }
        try {
          decodedKey = JSON.parse(
            Buffer.from(signaturePayload.protected, 'base64').toString(),
          )
        } catch (_err) {
          throw new ParseError(
            'Invalid JSON for protected payload (identity key).',
            ParseErrorType.InvalidIdentityKey,
          )
        }

        // Get the first identity key & signature
        if (!identityKey && decodedKey.name === identityKeyLabel) {
          identityKey = signaturePayload.protected
          identityKeyCount += 1
          identityKeySignature = signaturePayload.signature
        } else {
          // Increment the count of identity keys per address
          // And grab the signature for each address
          if (decodedKey.name === identityKeyLabel) {
            identityKeyCount += 1
            identityKeySignature = signaturePayload.signature
          }

          // Identity key must match across all addresses
          if (
            identityKey !== signaturePayload.protected &&
            decodedKey.name === identityKeyLabel
          ) {
            throw new ParseError(
              'More than one identity key detected. Only one identity key per PayID can be used.',
              ParseErrorType.MultipleIdentityKeys,
            )
          }

          // Each address must have only one identity key / signature pair
          if (identityKeyCount > 1) {
            throw new ParseError(
              'More than one identity key detected. Only one identity key per address can be used.',
              ParseErrorType.MultipleIdentityKeys,
            )
          }
        }
      },
    )
    // Transform to format consumable by insert user
    // And add to all addresses
    const jwsPayload = JSON.parse(verifiedAddress.payload)
    const databaseAddressPayload = {
      paymentNetwork: jwsPayload.payIdAddress.paymentNetwork,
      environment: jwsPayload.payIdAddress.environment,
      details: {
        address: jwsPayload.payIdAddress.addressDetails.address,
      },
      identityKeySignature,
    }
    formattedAddresses.push(databaseAddressPayload)
  })

  return [formattedAddresses, identityKey]
}
