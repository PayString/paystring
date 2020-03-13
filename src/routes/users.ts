import { Request, Response, NextFunction } from 'express'

import handleHttpError from '../services/errors'
import {
  updatePaymentPointer,
  updateAddressInformation,
} from '../services/paymentPointers'

export default async function putUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // TODO(dino): validate body params before this
  // TODO(dino): validate payment pointer before this
  let updatedAccountInfo
  try {
    // TODO(hans): destructure this Pick object
    updatedAccountInfo = await updatePaymentPointer(
      req.query.payment_pointer,
      req.body.payment_pointer,
    )
    if (updatedAccountInfo === undefined) {
      return handleHttpError(
        404,
        `User for ${req.query.payment_pointer} not found.`,
        res,
      )
    }
  } catch (err) {
    return handleHttpError(
      500,
      `Error updating payment pointer for account ${req.query.payment_pointer}.`,
      res,
      err,
    )
  }

  let updatedAddresses
  try {
    // TODO(hans): implement updateAddressInformation
    updatedAddresses = updateAddressInformation(
      req.body.addresses,
      updatedAccountInfo.id,
    )
  } catch (err) {
    return handleHttpError(
      500,
      `Error updating addresses for account ${req.body.account_id}.`,
      res,
    )
  }

  res.send({
    payment_pointer: updatedAccountInfo.payment_pointer,
    account_id: updatedAccountInfo.id,
    addresses: updatedAddresses,
  })

  return next()
}
