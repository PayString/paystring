import HttpStatus from '@xpring-eng/http-status'

/**
 * Custom Errors for PayID.
 */
export default abstract class PayIDError extends Error {
  public readonly httpStatusCode: HttpStatus
  public abstract readonly kind: string

  /**
   * Create a new PayIDError instance.
   *
   * @param message - The error message.
   * @param status - An HttpStatus code associated with this error.
   */
  public constructor(message: string, status: HttpStatus) {
    super(message)

    // All our custom errors will extend PayIDError
    // So use the name of the class extending PayIDError
    this.name = this.constructor.name
    this.httpStatusCode = status
  }

  /**
   * A custom toString method,
   * so our custom Errors include their `kind` when converted to a string.
   *
   * @returns A string representation of the PayIDError.
   */
  public toString(): string {
    return `${this.name}[${this.kind}]: ${this.message}`
  }
}
