import { Request, Response } from 'express'

import HttpStatus from '../types/httpStatus'

/**
 * Sends an HTTP response with the appropriate HTTP status and JSON-formatted payload (if any).
 *
 * It also sets the Location header on responses for 201 - Created responses.
 *
 * @param req - An Express Request object.
 * @param res - An Express Response object.
 */
export default function sendSuccess(req: Request, res: Response): void {
  const status = Number(res.locals?.status) || HttpStatus.OK

  // Set a location header when our status is 201 - Created
  if (status === HttpStatus.Created) {
    // The first part of the destructured array will be "", because the string starts with "/"
    // And for PUT commands, the path could potentially hold more after `userPath`.
    const [, userPath] = req.originalUrl.split('/')

    const locationHeader = ['', userPath, res.locals.payId].join('/')

    res.location(locationHeader)
  }

  if (res.locals.response) {
    res.status(status).json(res.locals.response)
  } else {
    res.sendStatus(status)
  }
}
