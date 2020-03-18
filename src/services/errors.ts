import { Response } from 'express'

import Boom = require('boom')

export default function handleHttpError(
  errorCode: number,
  msg: string,
  res: Response,
  err?: Error,
): void {
  // logging for our debugging purposes
  if (errorCode >= 500) {
    console.error(errorCode, ':', msg, err)
  } else {
    console.log(errorCode, ':', msg)
  }

  // error code matching
  let error: Boom.Payload
  switch (errorCode) {
    case 400:
      error = Boom.badRequest(msg).output.payload
      break

    case 404:
      error = Boom.notFound(msg).output.payload
      break

    default:
      // this is a 500 internal server error
      error = Boom.badImplementation(msg).output.payload
  }

  res.status(errorCode).json(error)
}
