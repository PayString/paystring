import { CryptoAddressDetails, AchAddressDetails } from './publicAPI'

/**
 * Model of the Account table schema for the database.
 */
export interface Account {
  readonly id: string
  payId: string

  readonly createdAt: Date
  readonly updatedAt: Date
}

/**
 * Model of the Address table schema for the database.
 */
export interface Address {
  readonly id: number
  accountId: string

  paymentNetwork: string
  environment?: string | null
  details: CryptoAddressDetails | AchAddressDetails

  readonly createdAt: Date
  readonly updatedAt: Date
}

/**
 * The information retrieved from or inserted into the database for a given address.
 */
export type AddressInformation = Pick<
  Address,
  'paymentNetwork' | 'environment' | 'details'
>
