/* eslint-disable no-inline-comments */

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
 * Payment information included in an Invoice or by itself (in the case of a GET request to the base path /).
 */
export interface PaymentInformation {
  addressDetailsType: AddressDetailsType
  addressDetails: CryptoAddressDetails | AchAddressDetails
  proofOfControlSignature?: string
  payId?: string
  memo?: string
}

/**
 * Invoice should always contain the PayID.
 */
export interface InvoicePaymentInformation extends PaymentInformation {
  payId: string
}

/**
 * Invoice included in a SignatureWrapper when a GET request is made to the /invoice endpoint.
 */
export interface PaymentSetupDetails {
  txId: number
  expirationTime: number // unix timestamp
  paymentInformation: InvoicePaymentInformation
  complianceRequirements: ComplianceType[] // e.g. TravelRule
  memo?: string // 1 kb max
  complianceHashes: ComplianceHash[]
}

/**
 * Hash of Compliance data (e.g. Travel Rule) to indicate the originating institution that the Compliance data has been received.
 */
export interface ComplianceHash {
  type: ComplianceType
  hash: string
}

/**
 * Travel rule data potentially included in a Compliance object.
 */
export interface TravelRule {
  originator: {
    userLegalName: string
    accountId: string
    userPhysicalAddress: string
    institutionName: string
    value: {
      amount: string
      scale: number
    }
    timestamp: number
  }
  beneficiary: {
    institutionName: string
    userLegalName?: string
    userPhysicalAddress?: string
    accountId?: string
  }
}

/**
 * Type of Compliance data.
 */
export enum ComplianceType {
  TravelRule = 'TravelRule',
}

/**
 * Compliance data included in a SignatureWrapper when POSTing to the /invoice endpoint.
 */
export interface Compliance {
  type: ComplianceType
  data: TravelRule
  memo?: string // 1 kb max
}

/**
 * A payment proof included in a SignatureWrapper when POSTing to the /payment-proofs endpoint.
 */
export interface PaymentProof {
  invoiceHash: string
  transactionConfirmation: string
  txId: number
  memo?: string
}

/**
 * Supported custom message types for requests/responses in PayID.
 */
export enum MessageType {
  PaymentSetupDetails = 'PaymentSetupDetails',
  Compliance = 'Compliance',
  PaymentProof = 'PaymentProof',
}

/**
 * Wrapper to cryptographically secure all messages in PayID.
 */
export interface SignatureWrapper {
  messageType: MessageType
  message: PaymentSetupDetails | Compliance | PaymentProof
  publicKeyType: string
  publicKeyData: string[]
  publicKey: string
  signature: string
}
