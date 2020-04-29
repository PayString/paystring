import HttpStatus from '../types/httpStatus'

import PayIDError from './errors'

export enum DatabaseErrorType {
  UniquePayIdViolation = 'UniquePayIdViolation',
  Unknown = 'Unknown',
}

export default class DatabaseError extends PayIDError {
  public readonly kind: DatabaseErrorType

  constructor(message: string, kind: DatabaseErrorType, status: HttpStatus) {
    super(message, status)
    this.kind = kind
  }
}

// HELPER FUNCTIONS

export function handleDatabaseError(error: Error, payId: string): never {
  if (
    error.message.includes('violates unique constraint "account_pay_id_key"')
  ) {
    throw new DatabaseError(
      `There already exists a user with the PayID ${payId}`,
      DatabaseErrorType.UniquePayIdViolation,
      HttpStatus.Conflict,
    )
  }

  throw new DatabaseError(
    'Error updating payment pointer for account',
    DatabaseErrorType.Unknown,
    HttpStatus.InternalServerError,
  )

  // TODO: What about when Postgres is down?
}
