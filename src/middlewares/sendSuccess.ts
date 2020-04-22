import { Request, Response } from 'express'

import HttpStatus from '../types/httpStatus'

export default function sendSuccess(req: Request, res: Response): void {
  const status = res.locals.status || HttpStatus.OK

  // Set a location header when our status is 201 - Created
  if (status === HttpStatus.Created) {
    // The first part of the destructured array will be "", because the string starts with "/"
    // And for PUT commands, the path could potentially hold more after `userPath`.
    const [, version, userPath] = req.originalUrl.split('/')

    const locationHeader = ['', version, userPath, res.locals.pay_id].join('/')

    res.location(locationHeader)
  }

  if (res.locals.response) {
    res.status(status).json(res.locals.response)
  } else {
    res.sendStatus(status)
  }
}
