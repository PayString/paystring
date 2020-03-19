export enum AddressDetailType {
  CryptoAddress = 'CryptoAddressDetails',
  AchAddress = 'AchAddressDetails',
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
  addressDetailType: AddressDetailType
  addressDetails: CryptoAddressDetails | AchAddressDetails
  proofOfControlSignature?: string
}
