import { ComplianceData } from '../types/publicAPI'
import logger from '../utils/logger'

/**
 * A skeleton function that will eventually identify if an input is valid ComplianceData.
 *
 * @param complianceData - An input that may or may not be a ComplianceData object.
 *
 * @returns A ComplianceData object.
 */
export function parseComplianceData(complianceData: unknown): ComplianceData {
  logger.info('Validating Compliance Data..')
  return complianceData as ComplianceData
}

/**
 * A skeleton function that will eventually process a ComplianceData object.
 *
 * @param complianceData - A ComplianceData object.
 */
export function handleComplianceData(complianceData: ComplianceData): void {
  logger.info('Compliance data processed:')
  logger.info(JSON.stringify(complianceData, null, 2))
}
