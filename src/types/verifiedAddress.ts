/* eslint-disable import/no-cycle --
Cycle between this file and types/publicApi.ts. Should we combine these into one? */
import { Address } from './publicAPI'

/**
 * Object containing address information alongside signatures.
 */
export interface VerifiedAddress {
  readonly payload: VerifiedAddressPayload
  readonly signatures: readonly VerifiedAddressSignature[]
}

interface VerifiedAddressPayload {
  payId: string
  payIdAddress: Address
}

/**
 * JWS object for verification.
 */
interface VerifiedAddressSignature {
  protected: string
  signature: string
}
