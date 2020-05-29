import { assert } from 'chai'

import {
  formatPaymentInfo,
  getPreferredAddressHeaderPair,
  getAddressDetailsType,
} from '../../src/services/basePayId'
import { AddressInformation } from '../../src/types/database'
import { AddressDetailsType } from '../../src/types/publicAPI'

describe('Base PayID - getAddressDetailsType()', function (): void {
  it('Returns AchAddressDetails for addressDetailsType when formatting ACH AddressInformation', function () {
    // GIVEN an array of AddressInformation with a single ACH (empty environment) entry
    const addressInfo = {
      paymentNetwork: 'ACH',
      environment: null,
      details: {
        accountNumber: '000123456789',
        routingNumber: '123456789',
      },
    }

    // WHEN we get the address details type
    const addressDetailsType = getAddressDetailsType(addressInfo)

    // THEN we get back an AddressDetailsType of AchAddress
    assert.deepStrictEqual(addressDetailsType, AddressDetailsType.AchAddress)
  })

  it('Returns CryptoAddressDetails for addressDetailsType when formatting XRP AddressInformation', function () {
    // GIVEN an array of AddressInformation with a single XRP entry
    const addressInfo = {
      paymentNetwork: 'XRP',
      environment: 'TESTNET',
      details: {
        address: 'TVacixsWrqyWCr98eTYP7FSzE9NwupESR4TrnijN7fccNiS',
      },
    }

    // WHEN we get the address details type
    const addressDetailsType = getAddressDetailsType(addressInfo)

    // THEN we get back an AddressDetailsType of CryptoAddress
    assert.deepStrictEqual(addressDetailsType, AddressDetailsType.CryptoAddress)
  })
})

describe('Base PayID - formatPaymentInfo()', function (): void {
  it('Returns CryptoAddressDetails & AchAddressDetails for addressDetailsTypes when formatting array with multiple AddressInformation', function () {
    // GIVEN an array of AddressInformation with an ACH and entry
    const payId = 'alice$example.com'
    const addressInfo = [
      {
        paymentNetwork: 'XRP',
        environment: 'TESTNET',
        details: {
          address: 'TVacixsWrqyWCr98eTYP7FSzE9NwupESR4TrnijN7fccNiS',
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
            address: 'TVacixsWrqyWCr98eTYP7FSzE9NwupESR4TrnijN7fccNiS',
          },
        },
        {
          paymentNetwork: 'ACH',
          addressDetailsType: AddressDetailsType.AchAddress,
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
          address: 'TVacixsWrqyWCr98eTYP7FSzE9NwupESR4TrnijN7fccNiS',
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
            address: 'TVacixsWrqyWCr98eTYP7FSzE9NwupESR4TrnijN7fccNiS',
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
          addressDetailsType: AddressDetailsType.AchAddress,
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
          address: 'TVacixsWrqyWCr98eTYP7FSzE9NwupESR4TrnijN7fccNiS',
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
            address: 'TVacixsWrqyWCr98eTYP7FSzE9NwupESR4TrnijN7fccNiS',
          },
        },
      ],
      payId: 'alice$example.com',
      memo: 'memo',
    }

    // AND GIVEN a createMemo() that returns a truthy value
    function memoFn(): string {
      return 'memo'
    }

    // WHEN we format the address information
    const paymentInfo = formatPaymentInfo(addressInfo, payId, memoFn)

    // THEN we get back a PaymentInformation object with a memo
    assert.deepStrictEqual(paymentInfo, expectedPaymentInfo)
  })
})

describe('Base PayID - getPreferredAddressInfo()', function (): void {
  let addressInfo: AddressInformation[]

  beforeEach(function () {
    addressInfo = [
      {
        paymentNetwork: 'XRPL',
        environment: 'TESTNET',
        details: {
          address: 'TVacixsWrqyWCr98eTYP7FSzE9NwupESR4TrnijN7fccNiS',
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
  })

  it('Returns all addresses & payid media type if payment network is PAYID', function () {
    // GIVEN an array of addresses and array of AcceptMediaTypes
    const acceptMediaTypes = [
      {
        mediaType: 'application/payid+json',
        paymentNetwork: 'PAYID',
      },
    ]
    const expectedAddressInfo = {
      preferredParsedAcceptHeader: {
        mediaType: 'application/payid+json',
        paymentNetwork: 'PAYID',
      },
      preferredAddresses: addressInfo,
    }

    // WHEN we try get get the preferred addresses for PAYID payment network
    const preferredAddressInfo = getPreferredAddressHeaderPair(
      addressInfo,
      acceptMediaTypes,
    )

    // THEN we return all the addresses we have
    assert.deepStrictEqual(preferredAddressInfo, expectedAddressInfo)
  })

  it('Returns the first order preferred address when found', function () {
    // GIVEN an array of addresses and array of AcceptMediaTypes
    const acceptMediaTypes = [
      {
        mediaType: 'application/xrpl-testnet+json',
        environment: 'TESTNET',
        paymentNetwork: 'XRPL',
      },
    ]
    const expectedAddressInfo = {
      preferredParsedAcceptHeader: {
        mediaType: 'application/xrpl-testnet+json',
        environment: 'TESTNET',
        paymentNetwork: 'XRPL',
      },
      preferredAddresses: [addressInfo[0]],
    }

    // WHEN we try get get the preferred addresses for XRP payment network
    const preferredAddressInfo = getPreferredAddressHeaderPair(
      addressInfo,
      acceptMediaTypes,
    )

    // THEN we get back the XRP addresses
    assert.deepStrictEqual(preferredAddressInfo, expectedAddressInfo)
  })

  it('Returns the second order preferred address when the first is not found', function () {
    // GIVEN an array of addresses and array of AcceptMediaTypes
    const acceptMediaTypes = [
      {
        mediaType: 'application/xrpl-mainnet+json',
        environment: 'MAINNET',
        paymentNetwork: 'XRPL',
      },
      {
        mediaType: 'application/ach+json',
        paymentNetwork: 'ACH',
      },
    ]
    const expectedAddressInfo = {
      preferredParsedAcceptHeader: {
        mediaType: 'application/ach+json',
        paymentNetwork: 'ACH',
      },
      preferredAddresses: [addressInfo[1]],
    }

    // WHEN we try get get the preferred addresses for XRP, ACH payment network
    const preferredAddressInfo = getPreferredAddressHeaderPair(
      addressInfo,
      acceptMediaTypes,
    )

    // THEN we get back the ACH addresses (because XRP was not found)
    assert.deepStrictEqual(preferredAddressInfo, expectedAddressInfo)
  })

  it('Returns undefined if no preferred address found', function () {
    // GIVEN an array of addresses and array of AcceptMediaTypes
    const acceptMediaTypes = [
      {
        mediaType: 'application/xrpl-mainnet+json',
        environment: 'MAINNET',
        paymentNetwork: 'XRPL',
      },
    ]

    // WHEN we try get get the preferred addresses for XRP network on mainnet
    const preferredAddressInfo = getPreferredAddressHeaderPair(
      addressInfo,
      acceptMediaTypes,
    )

    // THEN we get back undefined, because XRP network on mainnet was not found
    assert.strictEqual(preferredAddressInfo, undefined)
  })
})
