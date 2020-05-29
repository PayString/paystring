import HttpStatus from '../../types/httpStatus'
import logger from '../logger'

import PayIDError from './payIdError'

// These errors are triggered when we encounter a problem running a database query,
// which causes the query to not complete.
//
// For example, a NotNullViolation error would be raised if we tried updating/inserting
// a non-nullable column with a `null` value.
export enum DatabaseErrorType {
  InvalidPayId = 'InvalidPayId',
  EmptyStringViolation = 'EmptyStringViolation',
  StringCaseViolation = 'StringCaseViolation',
  UniqueConstraintViolation = 'UniqueConstraintViolation',
  NotNullViolation = 'NotNullViolation',
  Unknown = 'Unknown',
}

// Exported for testing purposes
export enum DatabaseErrorMessage {
  InvalidPayId = 'The PayID provided was in an invalid format',

  EmptyStringPayId = 'The PayID was an empty string, which is invalid',
  EmptyStringPaymentNetwork = "The 'payment_network' of an address was an empty string, which is invalid",
  EmptyStringEnvironment = "The 'environment' of an address was an empty string, which is invalid",

  StringCasePayId = 'The PayID provided had uppercase characters, but must be all lowercase',
  StringCasePaymentNetwork = "The 'payment_network' provided had lowercase characters, but must be all uppercase",
  StringCaseEnvironment = "The 'environment' provided had lowercase characters, but must be all uppercase",

  UniqueConstraintPayId = 'There already exists a user with the provided PayID',
  UniqueConstraintAddress = 'More than one address for the same (payment_network, environment) tuple was provided',

  NotNull = 'NULL was given for a required value.',
  Unknown = 'An unknown error occurred.',
}

export default class DatabaseError extends PayIDError {
  public readonly kind: DatabaseErrorType

  public constructor(
    message: string,
    kind: DatabaseErrorType,
    status: HttpStatus,
  ) {
    super(message, status)

    this.kind = kind
  }
}

// HELPER FUNCTIONS
/* eslint-disable max-lines-per-function --
 * TODO:(hbergren), it might be worth refactoring this into smaller helper functions,
 * to make this easier to reason about.
 */
export function handleDatabaseError(error: Error): never {
  logger.debug(error)

  // InvalidPayId Errors
  if (error.message.includes('valid_pay_id')) {
    throw new DatabaseError(
      DatabaseErrorMessage.InvalidPayId,
      DatabaseErrorType.InvalidPayId,
      HttpStatus.InternalServerError,
    )
  }

  // EmptyStringViolation Errors
  if (error.message.includes('pay_id_length_nonzero')) {
    throw new DatabaseError(
      DatabaseErrorMessage.EmptyStringPayId,
      DatabaseErrorType.EmptyStringViolation,
      HttpStatus.InternalServerError,
    )
  }

  if (error.message.includes('payment_network_length_nonzero')) {
    throw new DatabaseError(
      DatabaseErrorMessage.EmptyStringPaymentNetwork,
      DatabaseErrorType.EmptyStringViolation,
      HttpStatus.InternalServerError,
    )
  }

  if (error.message.includes('environment_length_nonzero')) {
    throw new DatabaseError(
      DatabaseErrorMessage.EmptyStringEnvironment,
      DatabaseErrorType.EmptyStringViolation,
      HttpStatus.InternalServerError,
    )
  }

  // StringCaseViolation Errors
  if (error.message.includes('pay_id_lowercase')) {
    throw new DatabaseError(
      DatabaseErrorMessage.StringCasePayId,
      DatabaseErrorType.StringCaseViolation,
      HttpStatus.InternalServerError,
    )
  }

  if (error.message.includes('payment_network_uppercase')) {
    throw new DatabaseError(
      DatabaseErrorMessage.StringCasePaymentNetwork,
      DatabaseErrorType.StringCaseViolation,
      HttpStatus.InternalServerError,
    )
  }

  if (error.message.includes('environment_uppercase')) {
    throw new DatabaseError(
      DatabaseErrorMessage.StringCaseEnvironment,
      DatabaseErrorType.StringCaseViolation,
      HttpStatus.InternalServerError,
    )
  }

  // UniqueConstraintViolation Errors
  if (error.message.includes('account_pay_id_key')) {
    throw new DatabaseError(
      DatabaseErrorMessage.UniqueConstraintPayId,
      DatabaseErrorType.UniqueConstraintViolation,
      HttpStatus.Conflict,
    )
  }

  if (
    error.message.includes(
      'one_address_per_account_payment_network_environment_tuple',
    )
  ) {
    throw new DatabaseError(
      DatabaseErrorMessage.UniqueConstraintAddress,
      DatabaseErrorType.UniqueConstraintViolation,
      HttpStatus.Conflict,
    )
  }

  // General errors
  if (error.message.includes('violates not-null constraint')) {
    throw new DatabaseError(
      DatabaseErrorMessage.NotNull,
      DatabaseErrorType.NotNullViolation,
      HttpStatus.InternalServerError,
    )
  }

  throw new DatabaseError(
    DatabaseErrorMessage.Unknown,
    DatabaseErrorType.Unknown,
    HttpStatus.InternalServerError,
  )

  // TODO:(hbergren) Knex does not yet handle connection errors:
  // https://github.com/knex/knex/issues/3113
}
/* eslint-enable max-lines-per-function */
