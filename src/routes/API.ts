import { Request, Response } from 'express'

export default function sendSuccess(req: Request, res: Response): void {
  if (res.locals.response) {
    res.status(200).json(res.locals.response)
  } else {
    res.sendStatus(200)
  }
}
