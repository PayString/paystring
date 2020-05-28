import HttpStatus from '../../types/httpStatus'

import PayIDError from './payIdError'

export enum ParseErrorType {
  InvalidMediaType = 'InvalidMediaType',
}

export default class ParseError extends PayIDError {
  public readonly kind: ParseErrorType

  public constructor(message: string, kind: ParseErrorType) {
    // All parsing errors are the result of a bad request
    super(message, HttpStatus.BadRequest)
    this.kind = kind
  }
}
