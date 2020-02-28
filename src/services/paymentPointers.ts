import { Request, Response, NextFunction } from 'express'

export default function getAddressFromPaymentPointer(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.send('TODO: payment pointer hit')
  console.log('payment pointer resolution service hit')
  // TODO(hbergen): implement resolution of $payment.pointer -> address
  next()
}
