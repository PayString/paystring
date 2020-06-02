import { mockComplianceData } from '../data/travelRuleData'
import { ComplianceData } from '../types/publicAPI'
import logger from '../utils/logger'

export function parseComplianceData(complianceData: unknown): ComplianceData {
  logger.info(`validate compliance data: ${JSON.stringify(complianceData)}`)
  return mockComplianceData
}

export function handleComplianceData(complianceData: ComplianceData): void {
  logger.info(`handle compliance data: ${JSON.stringify(complianceData)}`)
}
