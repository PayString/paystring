import { mockComplianceData } from '../data/travelRuleData'
import { ComplianceData } from '../types/publicAPI'
import logger from '../utils/logger'

/**
 * A skeleton function that will eventually identify if an input is valid ComplianceData.
 *
 * @param complianceData - = An input that may or may not be a ComplianceData object.
 *
 * @returns A fake ComplianceData object.
 */
export function parseComplianceData(complianceData: unknown): ComplianceData {
  logger.info(`validate compliance data: ${JSON.stringify(complianceData)}`)
  return mockComplianceData
}

/**
 * A fake function that will eventually process a ComplianceData object.
 *
 * @param complianceData - A fake ComplianceData object.
 */
export function handleComplianceData(complianceData: ComplianceData): void {
  logger.info(`handle compliance data: ${JSON.stringify(complianceData)}`)
}
