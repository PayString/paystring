import { NextFunction, Request, Response } from 'express'

import config from '../config'
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
export default async function constructJrd(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const payId = req.query.resource
  if (!payId || Array.isArray(payId) || typeof payId !== 'string') {
    throw new ParseError(
      'A `payId` must be provided in the resource request parameter.',
      ParseErrorType.MissingPayId,
    )
  }

  const links = generateLinks()
  res.locals.response = {
    subject: payId,
    links,
  }

  return next()
}

/**
 * Represents a Link object in a PayID Discovery JRD (JSON Resource Descriptor).
 */
interface JrdLink {
  rel: string
  template: string
}

/**
 * Generate a list of JrdLinks to return as a result of PayID Discovery.
 *
 * @returns An array of JrdLinks containing PayID Discovery metadata.
 */
function generateLinks(): JrdLink[] {
  return [
    {
      rel: 'https://payid.org/ns/easy-checkout-url/1.0',
      template: config.discovery.easyCheckoutTemplate,
    },
  ]
}
