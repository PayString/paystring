import { mockComplianceData } from '../data/travelRuleData'
import { Compliance } from '../types/publicAPI'
import logger from '../utils/logger'

export function parseComplianceData(complianceData: unknown): Compliance {
  logger.info(`validate compliance data: ${JSON.stringify(complianceData)}`)
  return mockComplianceData
}

export function handleComplianceData(complianceData: Compliance): void {
  logger.info(`handle compliance data: ${JSON.stringify(complianceData)}`)
}
