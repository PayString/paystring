/**
 * Type of payment address in PaymentInformation.
 */
export enum AddressDetailsType {
  CryptoAddress = 'CryptoAddressDetails',
  AchAddress = 'AchAddressDetails',
}

/**
 * Matching schema for AddressDetailsType.CryptoAddress.
 */
export interface CryptoAddressDetails {
  address: string
  tag?: string
}

/**
 * Matching schema for AddressDetailsType.AchAddress.
 */
export interface AchAddressDetails {
  accountNumber: string
  routingNumber: string
}

/**
 * Payment information included in a PaymentSetupDetails or by itself (in the
 * case of a GET request to the base path /).
 */
export interface PaymentInformation {
  addresses: Address[]
  proofOfControlSignature?: string
  payId?: string
  memo?: string
}

/**
 * Address information included inside of a PaymentInformation object.
 */
export interface Address {
  paymentNetwork: string
  environment?: string
  addressDetailsType: AddressDetailsType
  addressDetails: CryptoAddressDetails | AchAddressDetails
}
