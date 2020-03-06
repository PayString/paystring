import { Request, Response, NextFunction } from 'express'

import knex from '../db/knex'
import Address from '../models/address'

/**
 * Resolves inbound requests to a payment pointer to their
 * respective ledger addresses or other payment information required.
 */
export default async function getPaymentInfoFromPaymentPointer(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const currency = 'XRP'
  const network = 'TESTNET'

  // TODO: This paymentPointer resolution should happen outside this file. paymentPointer should be an input to this function.
  /**
   * NOTE: if you plan to expose your payment pointer with a port number, you
   * should use:
   *  const paymentPointerUrl =
   *  `${req.protocol}://${req.hostname}:${Config.publicAPIPort}${req.originalUrl}`
   */
  // TODO(aking): stop hardcoding HTTPS. We should at minimum be using ${req.protocol}
  const paymentPointer = `https://${req.hostname}${req.originalUrl}`

  // Get the payment_information from the database, given our currency, network, and paymentPointer
  const paymentInformation = await knex
    .select('address.payment_information')
    .from<Address>('address')
    .innerJoin('account', 'address.account_id', 'account.id')
    .where('address.currency', currency)
    .andWhere('address.network', network)
    .andWhere('account.payment_pointer', paymentPointer)
    .then((rows: Pick<Address, 'payment_information'>[]) => rows[0])

  // TODO:(hbergren) Distinguish between missing payment pointer in system, and missing address for currency.
  // TODO: This res/next stuff should happen outside this file.
  if (paymentInformation === undefined) {
    res
      .status(404)
      .send(
        `Payment information for ${paymentPointer} in ${currency} on ${network} could not be found.`,
      )

    return next()
  }

  res.send(paymentInformation.payment_information)
  return next()
}
