import { NextFunction, Request, Response } from 'express'

import * as discoveryLinks from '../discoveryLinks.json'
import { ParseError, ParseErrorType } from '../utils/errors'

/**
 * Constructs a PayID Discovery JRD from a PayID.
 *
 * @param req - Contains a PayID as a query parameter.
 * @param res - Stores the JRD to be returned to the client.
 * @param next - Passes req/res to next middleware.
 * @returns A Promise resolving to nothing.
 * @throws ParseError if the PayID is missing from the request parameters.
 */
export default function constructJrd(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const payId = req.query.resource

  // Query parameters could be a string or a ParsedQs, or an array of either.
  // PayID Discovery only allows for one 'resource' query parameter, so we
  // check for that here.
  if (!payId || Array.isArray(payId) || typeof payId !== 'string') {
    throw new ParseError(
      'A PayID must be provided in the `resource` request parameter.',
      ParseErrorType.MissingPayId,
    )
  }

  res.locals.response = {
    subject: payId,
    discoveryLinks,
  }

  return next()
}
