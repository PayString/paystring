/* eslint-disable no-inline-comments -- It is useful to have inline comments for interfaces. */
/**
 * Type of payment address in PaymentInformation.
 */
export enum AddressDetailsType {
  CryptoAddress = 'CryptoAddressDetails',
  FiatAddress = 'FiatAddressDetails', // Replaces AchAddressDetails
  AchAddress = 'AchAddressDetails', // Maintain compatibility for 1.0
}

/**
 * Matching schema for AddressDetailsType.CryptoAddress.
 */
export interface CryptoAddressDetails {
  readonly address: string
  readonly tag?: string
}

/**
 * Matching schema for AddressDetailsType.FiatAddress.
 */
export interface FiatAddressDetails {
  readonly accountNumber: string
  readonly routingNumber?: string
}

/**
 * The payment information response payload of a PayID Protocol (Public API) request.
 */
export interface PaymentInformation {
  readonly payId?: string
  readonly version?: string
  readonly addresses: Address[]
  readonly verifiedAddresses: VerifiedAddress[]
  readonly memo?: string
}

/**
 * Address information included inside of a PaymentInformation object.
 */
export interface Address {
  readonly paymentNetwork: string
  readonly environment?: string
  readonly addressDetailsType: AddressDetailsType
  readonly addressDetails: CryptoAddressDetails | FiatAddressDetails
}

/**
 * Object containing address information alongside signatures.
 */
export interface VerifiedAddress {
  readonly payload: string
  readonly signatures: readonly VerifiedAddressSignature[]
}

/**
 * JWS object for verification.
 */
export interface VerifiedAddressSignature {
  name?: string
  protected: string
  signature: string
}
