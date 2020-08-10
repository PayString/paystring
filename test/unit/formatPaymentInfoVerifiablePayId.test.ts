import { assert } from 'chai'

import { formatPaymentInfo } from '../../src/services/basePayId'
import { AddressInformation } from '../../src/types/database'
import {
  PaymentInformation,
  AddressDetailsType,
} from '../../src/types/protocol'

describe('Verifiable PayID - formatPaymentInfo()', function (): void {
  it('Returns properly formatted array for Verifiable PayID', function () {
    // GIVEN an array of AddressInformation with an ACH entry
    const version1dot1 = '1.1'
    const payId = 'alice$example.com'
    const verifiedAddressInfo: AddressInformation[] = [
      {
        paymentNetwork: 'XRP',
        environment: 'TESTNET',
        details: {
          address: 'rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS',
        },
        identityKeySignature: 'xrpSignature',
      },
      {
        paymentNetwork: 'ACH',
        environment: null,
        details: {
          accountNumber: '000123456789',
          routingNumber: '123456789',
        },
        identityKeySignature: 'achSignature',
      },
    ]
    const expectedPaymentInfo: PaymentInformation = {
      addresses: [],
      verifiedAddresses: [
        {
          payload: {
            payId: 'alice$example.com',
            payIdAddress: {
              addressDetailsType: AddressDetailsType.CryptoAddress,
              environment: 'TESTNET',
              paymentNetwork: 'XRP',
              addressDetails: {
                address: 'rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS',
              },
            },
          },
          signatures: [
            {
              name: 'identityKey',
              protected: 'anIdentityKey',
              signature: 'xrpSignature',
            },
          ],
        },
        {
          payload: {
            payId: 'alice$example.com',
            payIdAddress: {
              addressDetailsType: AddressDetailsType.FiatAddress,
              paymentNetwork: 'ACH',
              addressDetails: {
                accountNumber: '000123456789',
                routingNumber: '123456789',
              },
            },
          },
          signatures: [
            {
              name: 'identityKey',
              protected: 'anIdentityKey',
              signature: 'achSignature',
            },
          ],
        },
      ],
      payId: 'alice$example.com',
    }

    // WHEN we format it
    const paymentInfo = formatPaymentInfo(
      [],
      verifiedAddressInfo,
      'anIdentityKey',
      version1dot1,
      payId,
    )

    // THEN we get back a PaymentInformation object with the appropriate address details
    assert.deepStrictEqual(paymentInfo, expectedPaymentInfo)
  })
})
