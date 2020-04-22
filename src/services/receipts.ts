import { mockReceipt } from '../data/travelRuleData'
import { Receipt } from '../types/publicAPI'
import logger from '../utils/logger'

export function parseReceipt(receipt: unknown): Receipt {
  logger.info(`validate receipt: ${JSON.stringify(receipt)}`)
  return mockReceipt
}

export function handleReceipt(receipt: Receipt): void {
  logger.info(`handle receipt: ${JSON.stringify(receipt)}`)
}
