import { AddressInformation } from '../types/database'
import { VerifiedAddress, VerifiedAddressSignature } from '../types/protocol'
import { ParseError, ParseErrorType } from '../utils/errors'

/**
 * Parse all verified addresses to confirm they use a single identity key &
 * return parsed output that can be inserted into the database.
 *
 * @param verifiedAddresses - Array of verified addresses that adheres the the Public API format.
 *
 * @returns Array of address inforation to be consumed by insertUser.
 */
export default function parseVerifiedAddresses(
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
        const decodedKey = JSON.parse(
          Buffer.from(signaturePayload.protected, 'base64').toString(),
        )

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
