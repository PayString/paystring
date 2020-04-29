import HttpStatus from '../types/httpStatus'

/**
 * Custom Errors for PayID.
 */
export default class PayIDError extends Error {
  public readonly httpStatusCode: HttpStatus

  public constructor(message: string, status: HttpStatus) {
    super(message)

    // All our custom errors will extend PayIDError
    // So use the name of the class extending PayIDError
    this.name = this.constructor.name
    this.httpStatusCode = status
  }
}
