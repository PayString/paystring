import { Request, Response, NextFunction } from 'express'

/**
 * Resolves inbound requests to a payment pointer to their
 * respective ledger addresses
 */
export default function getAddressFromPaymentPointer(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  /**
   * NOTE: if you plan to expose your payment pointer with a port number, you
   * should use:
   *  const paymentPointerUrl =
   *  `${req.protocol}://${req.hostname}:${Config.publicAPIPort}${req.originalUrl}`
   */
  const paymentPointerUrl = `${req.protocol}://${req.hostname}${req.originalUrl}`
  // TODO(hbergen): implement resolution of payment pointer URL -> address
  res.send(`Received request to payment pointer: ${paymentPointerUrl}`)
  console.log(`Received request to payment pointer: ${paymentPointerUrl}`)
  next()
}
