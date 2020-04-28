import { CryptoAddressDetails, AchAddressDetails } from './publicAPI'

/**
 * Model of the Account table schema for the database.
 */
export interface Account {
  readonly id: string
  pay_id: string

  readonly created_at: Date
  readonly updated_at: Date
}

/**
 * Model of the Address table schema for the database.
 */
export interface Address {
  readonly id: number
  account_id: string

  payment_network: string
  environment?: string
  details: CryptoAddressDetails | AchAddressDetails

  readonly created_at: Date
  readonly updated_at: Date
}

/**
 * The information retrieved from or inserted into the database for a given address.
 */
export type AddressInformation = Pick<
  Address,
  'payment_network' | 'environment' | 'details'
>
