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
 * Object containing a base64 encoded identity key (protected) alongside a
 * corresponding signature.
 */
interface VerifiedAddressSignature {
  protected: string
  signature: string
}
