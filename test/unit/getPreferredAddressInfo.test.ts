import { assert } from 'chai'

import { getPreferredAddressHeaderPair } from '../../src/services/basePayId'
import { AddressInformation } from '../../src/types/database'

describe('Base PayID - getPreferredAddressInfo()', function (): void {
  let addressInfo: AddressInformation[]

  beforeEach(function () {
    addressInfo = [
      {
        paymentNetwork: 'XRPL',
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
