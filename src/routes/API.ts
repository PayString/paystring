import { Request, Response } from 'express'

export default function sendSuccess(req: Request, res: Response): void {
  const status = res.locals.status || 200

  if (res.locals.response) {
    res.status(status).json(res.locals.response)
  } else {
    res.sendStatus(status)
  }
}
