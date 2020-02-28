import { Request, Response } from 'express'

export default class API {
  /**
   * If middleware functions all execute properly, this function will
   * set the HTTP code to 200 confirming to the user that all happened as
   * requested
   */
  static setStatusToSuccessMiddleware() {
    return (req: Request, res: Response): void => {
      res.status(200)
    }
  }
}
