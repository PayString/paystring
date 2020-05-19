import { mockInvoiceWithComplianceHashes } from '../data/travelRuleData'
import {
  PaymentSetupDetails,
  PaymentInformation,
  Compliance,
  ComplianceType,
} from '../types/publicAPI'

/**
 * Generates an Invoice containing receiver payment details, along with the Compliance requirements
 * that the sender must comply with. If the compliance data is included, the data is hashed and sent
 * back to the sender as part of the Invoice as confirmation that the data was received and processed
 * successfully.
 *
 * @param payId - PayID of the user receiving funds.
 * @param paymentInformation - Payment details (e.g. Crypto, ACH) of the user receiving funds.
 * @param complianceData - Compliance data of sender to satisfy any legal requirements.
 * @returns A valid Invoice to be sent to the client.
 */
export default function generateInvoice(
  payId: string,
  paymentInformation: PaymentInformation,
  complianceData?: Compliance,
): PaymentSetupDetails {
  // TODO(dino): Store whether a server needs to be travel rule compliant in the env
  // TODO(dino): Actually hash the compliance data
  // TODO(dino): Consider caching this invoice, or at least caching the compliance hashes
  // to retrieve for multiple compliance round trips. This won't be necessary for the foreseeable future,
  // and maybe never for our reference implementation (currently no plans to include any requirements
  // other than travel rule), so maybe this should be deleted.
  // TODO(dino): figure out where this hardcoded value should live or if it should be in a database

  // This is 1 hour in milliseconds
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const TIME_TO_EXPIRY = 60 * 60 * 1000

  const invoice: PaymentSetupDetails = {
    // TODO(aking + hbergren): replace this w/ table ID once we have TR
    // tables implemented
    txId: 148689,
    expirationTime: Date.now() + TIME_TO_EXPIRY,
    paymentInformation: {
      ...paymentInformation,
      payId,
    },
    complianceRequirements: [ComplianceType.TravelRule],
    complianceHashes: [],
  }

  if (complianceData) {
    return mockInvoiceWithComplianceHashes
  }
  return invoice
}
