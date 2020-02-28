import { Request, Response, NextFunction } from 'express'

export function getUser(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.send('TODO: get user')
  console.log('get user hit')
  // TODO(hbergen): implement retrieval
  next()
}

export function postUser(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.send('TODO: post user')
  console.log('post user hit')
  // TODO(hbergen): implement posting
  next()
}

export function putUser(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  // TODO(hbergren): implement user update
  res.send('TODO: put user')
  console.log('put user hit')
  next()
}

export function deleteUser(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  // TODO(hbergen(: implement user delete
  res.send('TODO: delete user')
  console.log('delete user hit')
  next()
}
