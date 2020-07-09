/**
 * Query result record for a count of addresses by environment and paymentNetwork.
 */
export interface AddressCount {
  paymentNetwork: string
  environment: string
  count: number
}
