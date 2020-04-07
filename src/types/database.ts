import { CryptoAddressDetails, AchAddressDetails } from './publicAPI'

/**
 * Model of the Account table schema for the database.
 */
export interface Account {
  readonly id: string
  payment_pointer: string
  readonly organization: string

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
  environment: string
  details: CryptoAddressDetails | AchAddressDetails

  readonly created_at: Date
  readonly updated_at: Date
}
