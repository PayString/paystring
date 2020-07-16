import { NextFunction, Request, Response } from 'express'

import generateLinks from './jrdLinks'

/**
 * Constructs a PayID Discovery JRD from a PayID.
 *
 * @param req - Contains a PayID as a query parameter.
 * @param res - Stores the JRD to be returned to the client.
 * @param next - Passes req/res to next middleware.
 * @returns A Promise resolving to nothing.
 */
export default async function constructJrd(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const payId = req.query.resource
  if (!payId || Array.isArray(payId) || typeof payId !== 'string') {
    // TODO: return error
    return next()
  }

  const links = generateLinks()
  res.locals.response = {
    subject: payId,
    links,
  }

  return next()
}
