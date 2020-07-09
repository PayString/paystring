import HttpStatus from '@xpring-eng/http-status'

import PayIDError from './payIdError'

/**
 * An enum containing the different kinds of HeaderError.
 */
export enum HeaderErrorType {
  UnsupportedMediaTypeHeader = 'UnsupportedMediaTypeHeader',
}

/**
 * A custom error type to organize logic around 415 - Unsupported Media Type errors.
 */
export default class HeaderError extends PayIDError {
  public readonly kind: HeaderErrorType

  /**
   * The constructor for new HeaderError.
   *
   * @param message - An error message.
   * @param kind - The kind of HeaderError for this error instance.
   */
  public constructor(message: string, kind: HeaderErrorType) {
    // All content type errors are the result of a 415 Unsupported Media Type error
    super(message, HttpStatus.UnsupportedMediaType)
    this.kind = kind
  }
}
