import HttpStatus from '@xpring-eng/http-status'

import { ParsedAcceptHeader } from '../../types/headers'

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
  public readonly headers?: readonly ParsedAcceptHeader[]

  /**
   * The constructor for new LookupErrors.
   *
   * @param message - An error message.
   * @param kind - The kind of LookupError for this instance.
   * @param headers - The headers used for the PayID lookup.
   */
  public constructor(
    message: string,
    kind: LookupErrorType,
    headers?: readonly ParsedAcceptHeader[],
  ) {
    // All lookup errors should return a 404 - Not Found
    super(message, HttpStatus.NotFound)
    this.kind = kind
    this.headers = headers
  }
}
