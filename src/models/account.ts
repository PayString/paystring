export default interface Account {
  readonly id: string // UUID. TODO:(hbergren) Can we type this better?
  payment_pointer: string // An HTTPS URL. TODO:(hbergren) Can we type this better?
  readonly organization: string

  readonly created_at: Date
  readonly updated_at: Date
}
