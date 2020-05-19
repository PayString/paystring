/**
 * Query result record for a count of PayIDs by environment and paymentNetwork.
 */
export interface PayIdCount {
  paymentNetwork: string
  environment: string
  count: number
}
