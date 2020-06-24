import HttpStatus from '@xpring-eng/http-status'

import PayIDError from './payIdError'

export enum LookupErrorType {
  MissingPayId = 'MissingPayId',
  MissingAddress = 'MissingAddress',
  // TODO: Remove Unknown after MissingPayId/MissingAddress are implemented
  Unknown = 'Unknown',
}

/**
 * A custom error class to organize logic around errors related to a 404 - Not Found.
 */
export default class LookupError extends PayIDError {
  public readonly kind: LookupErrorType

  /**
   * The constructor for new LookupErrors.
   *
   * @param message - An error message.
   * @param kind - The kind of LookupError for this instance.
   */
  public constructor(message: string, kind: LookupErrorType) {
    // All lookup errors should return a 404 - Not Found
    super(message, HttpStatus.NotFound)
    this.kind = kind
  }
}
