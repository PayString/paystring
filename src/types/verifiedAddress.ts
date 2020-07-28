import { Address } from './publicAPI'

/**
 * Object containing address information alongside signatures.
 */
// eslint-disable-next-line import/no-unused-modules -- will disable in next PR
export interface VerifiedAddress {
  readonly payload: VerifiedAddressPayload
  readonly signatures: readonly VerifiedAddressSignature[]
}

interface VerifiedAddressPayload {
  payId: string
  payIdAddress: Address
}

/**
 * Object containing a signature corresponding to an address.
 *
 * Protected -- base64 encoded identity key
 * signature -- base64 encoded signatureA.
 */
interface VerifiedAddressSignature {
  name: VerifiedAddressSignatureType
  protected: string
  signature: string
}

/**
 * Identifies the type of signature being used, as of now we are only
 * implementing IdentityKey signatures, but future types like
 * WebPKI or ProofOfControl should be added to this enum.
 */
enum VerifiedAddressSignatureType {
  IdentityKey = 'IdentityKey',
}
