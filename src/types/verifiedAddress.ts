import { Address } from './publicAPI'

/**
 * Object containing address information alongside signatures.
 */
// eslint-disable-next-line import/no-unused-modules -- will disable in next PR
export interface VerifiedAddress {
  readonly payload: VerifiedAddressPayload
  readonly signatures: VerifiedAddressSignature[]
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
  protected: string
  signature: string
}
