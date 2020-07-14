import { assert } from 'chai'

import { formatPaymentInfo } from '../../src/services/basePayId'
import { AddressDetailsType } from '../../src/types/publicAPI'

describe('Base PayID - formatPaymentInfo()', function (): void {
  it('Returns CryptoAddressDetails & FiatAddressDetails for addressDetailsTypes when formatting array with multiple AddressInformation', function () {
    // GIVEN an array of AddressInformation with an ACH entry
    const payId = 'alice$example.com'
    const addressInfo = [
      {
        paymentNetwork: 'XRP',
        environment: 'TESTNET',
        details: {
          address: 'rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS',
        },
      },
      {
        paymentNetwork: 'ACH',
        environment: null,
        details: {
          accountNumber: '000123456789',
          routingNumber: '123456789',
        },
      },
    ]
    const expectedPaymentInfo = {
      addresses: [
        {
          paymentNetwork: 'XRP',
          environment: 'TESTNET',
          addressDetailsType: AddressDetailsType.CryptoAddress,
          addressDetails: {
            address: 'rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS',
          },
        },
        {
          paymentNetwork: 'ACH',
          addressDetailsType: AddressDetailsType.FiatAddress,
          addressDetails: {
            accountNumber: '000123456789',
            routingNumber: '123456789',
          },
        },
      ],
      payId: 'alice$example.com',
    }

    // WHEN we format it
    const paymentInfo = formatPaymentInfo(addressInfo, payId)

    // THEN we get back a PaymentInformation object with the appropriate address details
    assert.deepStrictEqual(paymentInfo, expectedPaymentInfo)
  })

  it('Does not return a payId field when it is not included as a parameter', function (): void {
    // GIVEN an array of AddressInformation with an XRP entry
    const addressInfo = [
      {
        paymentNetwork: 'XRP',
        environment: 'TESTNET',
        details: {
          address: 'rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS',
        },
      },
    ]
    const expectedPaymentInfo = {
      addresses: [
        {
          paymentNetwork: 'XRP',
          environment: 'TESTNET',
          addressDetailsType: AddressDetailsType.CryptoAddress,
          addressDetails: {
            address: 'rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS',
          },
        },
      ],
    }

    // WHEN we format it and don't pass in a PayID
    const paymentInfo = formatPaymentInfo(addressInfo)

    // THEN we get back a PaymentInformation object without a PayID
    assert.deepStrictEqual(paymentInfo, expectedPaymentInfo)
  })

  it('Does not return a environment field when it is not included in the address information', function (): void {
    // GIVEN an array of AddressInformation with an ACH entry (no environment)
    const addressInfo = [
      {
        paymentNetwork: 'ACH',
        environment: null,
        details: {
          accountNumber: '000123456789',
          routingNumber: '123456789',
        },
      },
    ]

    const expectedPaymentInfo = {
      addresses: [
        {
          paymentNetwork: 'ACH',
          addressDetailsType: AddressDetailsType.FiatAddress,
          addressDetails: {
            accountNumber: '000123456789',
            routingNumber: '123456789',
          },
        },
      ],
    }

    // WHEN we format it
    const paymentInfo = formatPaymentInfo(addressInfo)

    // THEN we get back a PaymentInformation object with no environment
    assert.deepStrictEqual(paymentInfo, expectedPaymentInfo)
  })

  it('Returns a memo field when using a memo function that returns a truthy string', function (): void {
    // GIVEN an array of AddressInformation with an XRP entry
    const payId = 'alice$example.com'
    const addressInfo = [
      {
        paymentNetwork: 'XRP',
        environment: 'TESTNET',
        details: {
          address: 'rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS',
        },
      },
    ]

    const expectedPaymentInfo = {
      addresses: [
        {
          paymentNetwork: 'XRP',
          environment: 'TESTNET',
          addressDetailsType: AddressDetailsType.CryptoAddress,
          addressDetails: {
            address: 'rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS',
          },
        },
      ],
      payId: 'alice$example.com',
      memo: 'memo',
    }

    // AND GIVEN a createMemo() that returns a truthy value
    const memoFn = (): string => 'memo'

    // WHEN we format the address information
    const paymentInfo = formatPaymentInfo(addressInfo, payId, memoFn)

    // THEN we get back a PaymentInformation object with a memo
    assert.deepStrictEqual(paymentInfo, expectedPaymentInfo)
  })
})
