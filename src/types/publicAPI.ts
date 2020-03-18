export enum AddressDetailTypes {
  CryptoAddress = 'crypto',
  AchAddress = 'ach',
}

export interface CryptoAddressDetails {
  address: string
  tag?: string
}

export interface AchAddressDetails {
  accountNumber: string
  routingNumber: string
}

export interface PaymentInformation {
  addressDetailType: AddressDetailTypes
  addressDetails: CryptoAddressDetails | AchAddressDetails
  proofOfControlSignature?: string
}
