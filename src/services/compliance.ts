import { mockComplianceData } from '../data/travelRuleData'
import { Compliance } from '../types/publicAPI'

export function parseComplianceData(complianceData: unknown): Compliance {
  console.log(`validate compliance data: ${complianceData}`)
  return mockComplianceData
}

export function handleComplianceData(complianceData: Compliance): void {
  console.log(`handle compliance data: ${complianceData}`)
}
