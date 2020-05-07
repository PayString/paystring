import HttpStatus from '../../types/httpStatus'

import PayIDError from './payIdError'

export enum LookupErrorType {
  MissingPayId = 'MissingPayId',
  MissingAddress = 'MissingAddress',
  // TODO: Remove Unknown after MissingPayId/MissingAddress are implemented
  Unknown = 'Unknown',
}

export default class LookupError extends PayIDError {
  public readonly kind: LookupErrorType

  public constructor(message: string, kind: LookupErrorType) {
    // All lookup errors should return a 404 - Not Found
    super(message, HttpStatus.NotFound)
    this.kind = kind
  }
}
