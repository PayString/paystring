export default interface Address {
  readonly id: number
  readonly account_id: string // UUID. TODO:(hbergren) Can we type this better?

  currency: string
  network: string

  // Different currencies will have different properties in here
  payment_information: {
    [index: string]: string
  }

  readonly created_at: Date
  readonly updated_at: Date
}
