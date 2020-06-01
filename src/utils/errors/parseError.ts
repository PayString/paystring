import HttpStatus from '../../types/httpStatus'

import PayIDError from './payIdError'

export enum ParseErrorType {
  InvalidMediaType = 'InvalidMediaType',

  // These are the Public API version header errors for the PayID Protocol.
  MissingPayIdVersionHeader = 'MissingPayIdVersionHeader',
  InvalidPayIdVersionHeader = 'InvalidPayIdVersionHeader',
  UnsupportedPayIdVersionHeader = 'UnsupportedPayIdVersionHeader',

  // These are the Private API version header errors, for the CRUD PayID API service.
  MissingPayIdApiVersionHeader = 'MissingPayIdApiVersionHeader',
  InvalidPayIdApiVersionHeader = 'InvalidPayIdApiVersionHeader',
  UnsupportedPayIdApiVersionHeader = 'UnsupportedPayIdApiVersionHeader',
}

export default class ParseError extends PayIDError {
  public readonly kind: ParseErrorType

  public constructor(message: string, kind: ParseErrorType) {
    // All parsing errors are the result of a bad request
    super(message, HttpStatus.BadRequest)
    this.kind = kind
  }
}
