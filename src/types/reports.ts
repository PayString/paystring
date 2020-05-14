/**
 * Query result record for a count of PayIDs by environment and payment_network.
 */
export interface PayIdCount {
  payment_network: string
  environment: string
  count: number
}
