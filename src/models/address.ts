import { CryptoAddressDetails, AchAddressDetails } from '../types/publicAPI'

export default interface Address {
  readonly id: number
  account_id: string // UUID. TODO:(hbergren) Can we type this better?

  payment_network: string
  environment: string
  details: CryptoAddressDetails | AchAddressDetails

  readonly created_at: Date
  readonly updated_at: Date
}
