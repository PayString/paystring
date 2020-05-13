import { mockPaymentProof } from '../data/travelRuleData'
import { PaymentProof } from '../types/publicAPI'
import logger from '../utils/logger'

export function parsePaymentProof(paymentProof: unknown): PaymentProof {
  logger.info(`validate payment proof: ${JSON.stringify(paymentProof)}`)
  return mockPaymentProof
}

export function handlePaymentProof(paymentProof: PaymentProof): void {
  logger.info(`handle payment proof: ${JSON.stringify(paymentProof)}`)
}
