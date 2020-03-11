import { Request, Response, NextFunction } from 'express'

import getPaymentInfoFromPaymentPointer from '../services/paymentPointers'

/**
 * Resolves inbound requests to a payment pointer to their
 * respective ledger addresses or other payment information required.
 */
export default async function getPaymentInfo(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // TODO:(hbergren) remove these hardcoded values
  const currency = 'XRP'
  const network = 'TESTNET'

  /**
   * NOTE: if you plan to expose your payment pointer with a port number, you
   * should use:
   *  const paymentPointerUrl =
   *  `${req.protocol}://${req.hostname}:${Config.publicAPIPort}${req.originalUrl}`
   */
  // TODO(aking): stop hardcoding HTTPS. We should at minimum be using ${req.protocol}
  const paymentPointer = `https://${req.hostname}${req.originalUrl}`

  // Get the paymentInformation from the database
  const paymentInformation = await getPaymentInfoFromPaymentPointer(
    paymentPointer,
    currency,
    network,
  )

  // TODO:(hbergren) Distinguish between missing payment pointer in system, and missing address for currency/network.
  if (paymentInformation === undefined) {
    res
      .status(404)
      .send(
        `Payment information for ${paymentPointer} in ${currency} on ${network} could not be found.`,
      )

    return next()
  }

  res.send(paymentInformation)
  return next()
}
