import { mockPaymentSetupDetailsWithComplianceHashes } from '../data/travelRuleData'
import {
  PaymentSetupDetails,
  PaymentInformation,
  ComplianceData,
  ComplianceType,
} from '../types/publicAPI'

/**
 * Generates a PaymentSetup Details containing receiver payment details, along
 * with the Compliance requirements that the sender must comply with. If the
 * compliance data is included, the data is hashed and sent back to the sender
 * as part of the PaymentSetupDetails as confirmation that the data was
 * received and processed successfully.
 *
 * @param payId - PayID of the user receiving funds.
 * @param paymentInformation - Payment details (e.g. Crypto, ACH) of the user receiving funds.
 * @param complianceData - Compliance data of sender to satisfy any legal requirements.
 * @returns A valid PaymentSetupDetails to be sent to the client.
 */
export default function generatePaymentSetupDetails(
  payId: string,
  paymentInformation: PaymentInformation,
  complianceData?: ComplianceData,
): PaymentSetupDetails {
  // TODO(dino): Store whether a server needs to be travel rule compliant in the env
  // TODO(dino): Actually hash the compliance data
  // TODO(dino): Consider caching this PaymentSetupDetails, or at least caching the compliance hashes
  // to retrieve for multiple compliance round trips. This won't be necessary for the foreseeable future,
  // and maybe never for our reference implementation (currently no plans to include any requirements
  // other than travel rule), so maybe this should be deleted.
  // TODO(dino): figure out where this hardcoded value should live or if it should be in a database

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- This is 1 hour in milliseconds
  const TIME_TO_EXPIRY = 60 * 60 * 1000

  const paymentSetupDetails: PaymentSetupDetails = {
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
    return mockPaymentSetupDetailsWithComplianceHashes
  }
  return paymentSetupDetails
}
