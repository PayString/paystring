import { mockReceipt } from '../data/travelRuleData'
import { Receipt } from '../types/publicAPI'

export function parseReceipt(receipt: unknown): Receipt {
  console.log(`validate receipt: ${receipt}`)
  return mockReceipt
}

export function handleReceipt(receipt: Receipt): void {
  console.log(`handle receipt: ${receipt}`)
}
