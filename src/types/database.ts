import { CryptoAddressDetails, FiatAddressDetails } from './publicAPI'

/**
 * Model of the Account table schema for the database.
 */
export interface Account {
  readonly id: string
  readonly payId: string
  readonly identityKey?: string

  readonly createdAt: Date
  readonly updatedAt: Date
}

/**
 * Model of the Address table schema for the database.
 */
export interface Address {
  readonly id: number
  readonly accountId: string

  readonly paymentNetwork: string
  readonly environment?: string | null
  readonly details: CryptoAddressDetails | FiatAddressDetails

  readonly identityKeySignature?: string

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
