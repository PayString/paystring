import {
  PaymentSetupDetails,
  AddressDetailsType,
  ComplianceType,
  Compliance,
  PaymentProof,
} from '../types/publicAPI'

// TODO: update mocks with 'real' information from from a transaction so they
// can be used in e2e and unit tests
export const mockPaymentProof: PaymentProof = {
  paymentSetupDetailsHash: '',
  txId: 318188,
  transactionConfirmation: '',
  memo: 'the payment succeeded!',
}

export const mockComplianceData: Compliance = {
  type: ComplianceType.TravelRule,
  data: {
    originator: {
      userLegalName: 'Theodore Kalaw',
      accountId: 'ef841530-f476-429c-b8f3-de25a0a29f80 ',
      userPhysicalAddress: '520 Main Street',
      institutionName: 'xpring',
      value: {
        amount: '100',
        scale: 1,
      },
      timestamp: 1584722143,
    },
    beneficiary: {
      institutionName: 'xpring',
    },
  },
  memo: 'Example travel rule transaction',
}

// eslint-disable-next-line import/no-unused-modules -- TODO:(@dino-rodriguez) Should this be exported?
export const mockPaymentSetupDetails: PaymentSetupDetails = {
  txId: 581203,
  expirationTime: 1584723369,
  paymentInformation: {
    addresses: [
      {
        paymentNetwork: 'XRP',
        environment: 'TESTNET',
        addressDetailsType: AddressDetailsType.CryptoAddress,
        addressDetails: {
          address: 'T71Qcu6Txyi5y4aa6ZaVBD3aKC4oCbQTBQr3QfmJBywhnwm',
        },
      },
    ],
    proofOfControlSignature: '9743b52063cd84097a65d1633f5c74f5',
    payId: 'alice$xpring.money',
    memo: 'for a travel rule transaction',
  },
  complianceRequirements: [ComplianceType.TravelRule],
  memo: 'please send me travel rule data',
  complianceHashes: [],
}

// eslint-disable-next-line max-len -- Prettier cannot reformat this line to be <= 80 characters
export const mockPaymentSetupDetailsWithComplianceHashes: PaymentSetupDetails = {
  txId: 583289,
  expirationTime: 1584753369,
  paymentInformation: {
    addresses: [
      {
        paymentNetwork: 'XRP',
        environment: 'TESTNET',
        addressDetailsType: AddressDetailsType.CryptoAddress,
        addressDetails: {
          address: 'T71Qcu6Txyi5y4aa6ZaVBD3aKC4oCbQTBQr3QfmJBywhnwm',
        },
      },
    ],
    proofOfControlSignature: '9743b52063cd84097a65d1633f5c74f5',
    payId: 'alice$xpring.money',
    memo: 'travel rule transaction with compliance hash',
  },
  complianceRequirements: [ComplianceType.TravelRule],
  memo: 'thanks for travel rule data, here are your new payment setup details',
  complianceHashes: [
    {
      type: ComplianceType.TravelRule,
      hash: '8743b52063cd84097a65d1633f5c74f5',
    },
  ],
}
