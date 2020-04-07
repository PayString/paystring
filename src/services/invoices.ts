import {
  mockInvoiceWithComplianceHashes,
  mockInvoice,
} from '../data/travelRuleData'
import { Invoice, PaymentInformation, Compliance } from '../types/publicAPI'

export default function generateInvoice(
  _paymentData: PaymentInformation,
  complianceData?: Compliance,
): Invoice {
  if (complianceData) {
    return mockInvoiceWithComplianceHashes
  }
  return mockInvoice
}
