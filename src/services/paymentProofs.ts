import { mockPaymentProof } from '../data/travelRuleData'
import { PaymentProof } from '../types/publicAPI'
import logger from '../utils/logger'

/**
 * A mock skeleton function to identify if an input is a PaymentProof.
 *
 * @param paymentProof - An input that may or may not be a PaymentProof.
 *
 * @returns A fake PaymentProof object.
 */
export function parsePaymentProof(paymentProof: unknown): PaymentProof {
  logger.info(`validate payment proof: ${JSON.stringify(paymentProof)}`)
  return mockPaymentProof
}

/**
 * A mock function to handle a PaymentProof object that currently does nothing.
 *
 * @param paymentProof - A fake PaymentProof object.
 */
export function handlePaymentProof(paymentProof: PaymentProof): void {
  logger.info(`handle payment proof: ${JSON.stringify(paymentProof)}`)
}
