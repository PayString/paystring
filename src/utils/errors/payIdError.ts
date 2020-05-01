import HttpStatus from '../../types/httpStatus'

/**
 * Custom Errors for PayID.
 */
export default abstract class PayIDError extends Error {
  public readonly httpStatusCode: HttpStatus
  public abstract readonly kind: string

  public constructor(message: string, status: HttpStatus) {
    super(message)

    // All our custom errors will extend PayIDError
    // So use the name of the class extending PayIDError
    this.name = this.constructor.name
    this.httpStatusCode = status
  }

  public toString(): string {
    return `${this.name}[${this.kind}]: ${this.message}`
  }
}
