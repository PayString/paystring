import HttpStatus from '@xpring-eng/http-status'

import PayIDError from './payIdError'

/**
 * An enum containing the different kinds of ParseErrors.
 */
export enum ParseErrorType {
  InvalidMediaType = 'InvalidMediaType',

  // PayID Stuff
  MissingPayId = 'MissingPayId',
  InvalidPayId = 'InvalidPayId',

  // These are the Public API version header errors for the PayID Protocol.
  MissingPayIdVersionHeader = 'MissingPayIdVersionHeader',
  InvalidPayIdVersionHeader = 'InvalidPayIdVersionHeader',
  UnsupportedPayIdVersionHeader = 'UnsupportedPayIdVersionHeader',

  // These are the Admin API version header errors, for the CRUD PayID API service.
  MissingPayIdApiVersionHeader = 'MissingPayIdApiVersionHeader',
  InvalidPayIdApiVersionHeader = 'InvalidPayIdApiVersionHeader',
  UnsupportedPayIdApiVersionHeader = 'UnsupportedPayIdApiVersionHeader',
}

/**
 * A custom error type to organize logic around 400 - Bad Request errors.
 */
export default class ParseError extends PayIDError {
  public readonly kind: ParseErrorType

  /**
   * The constructor for new ParseErrors.
   *
   * @param message - An error message.
   * @param kind - The kind of ParseError for this error instance.
   */
  public constructor(message: string, kind: ParseErrorType) {
    // All parsing errors are the result of a bad request
    super(message, HttpStatus.BadRequest)
    this.kind = kind
  }
}
