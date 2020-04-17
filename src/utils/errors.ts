/**
 * Custom Errors for PayID.
 *
 * @field httpStatusCode? Used by an error handler to respond appropriately to a client.
 */
export default class PayIDError extends Error {
  public readonly httpStatusCode?: number

  constructor(message: string, status?: number) {
    // Breaks prototype chain since it uses the Error prototype
    super(message)

    // Restore the prototype chain
    Object.setPrototypeOf(this, new.target.prototype)

    this.name = 'PayIDError'
    this.httpStatusCode = status

    // Creates .stack property to capture stack trace
    Error.captureStackTrace(this)
  }
}
