import { PaymentProof } from '../types/publicAPI'
import logger from '../utils/logger'

/**
 * A skeleton function that will eventually identify if an input is a PaymentProof.
 *
 * @param paymentProof - An input that may or may not be a PaymentProof.
 *
 * @returns A PaymentProof object.
 */
export function parsePaymentProof(paymentProof: unknown): PaymentProof {
  logger.info('Validating Payment Proof..')
  return paymentProof as PaymentProof
}

/**
 * A skeleton function that will eventually handle a PaymentProof object.
 *
 * @param paymentProof - A PaymentProof object.
 */
export function handlePaymentProof(paymentProof: PaymentProof): void {
  logger.info(JSON.stringify(paymentProof, null, 2))
}
