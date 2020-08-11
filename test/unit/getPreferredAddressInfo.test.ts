import { assert } from 'chai'

import { getPreferredAddressHeaderPair } from '../../src/services/basePayId'
import { AddressInformation } from '../../src/types/database'
import { ParsedAcceptHeader } from '../../src/types/headers'

describe('Base PayID - getPreferredAddressInfo()', function (): void {
  let addressInfo: AddressInformation[]
  let verifiedAddressInfo: AddressInformation[]

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
    verifiedAddressInfo = [
      {
        paymentNetwork: 'XRPL',
        environment: 'TESTNET',
        details: {
          address: 'rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS',
        },
      },
      {
        paymentNetwork: 'ETH',
        environment: 'KOVAN',
        details: {
          address: '0x43F14dFF256E8e44b839AE00BE8E0e02fA7D18Db',
        },
      },
    ]
  })

  it('Returns all addresses & payid media type if payment network is PAYID', function () {
    // GIVEN an array of addresses and array of AcceptMediaTypes
    const acceptMediaTypes: ParsedAcceptHeader[] = [
      {
        mediaType: 'application/payid+json',
        paymentNetwork: 'PAYID',
      },
    ]
    const expectedAddressInfo: [
      ParsedAcceptHeader,
      AddressInformation[],
      AddressInformation[],
    ] = [
      {
        mediaType: 'application/payid+json',
        paymentNetwork: 'PAYID',
      },
      addressInfo,
      verifiedAddressInfo,
    ]

    // WHEN we try get get the preferred addresses for PAYID payment network
    const preferredAddressInfo = getPreferredAddressHeaderPair(
      addressInfo,
      verifiedAddressInfo,
      acceptMediaTypes,
    )

    // THEN we return all the addresses we have
    assert.deepStrictEqual(preferredAddressInfo, expectedAddressInfo)
  })

  it('Returns the first order preferred address when found', function () {
    // GIVEN an array of addresses and array of AcceptMediaTypes
    const acceptMediaTypes: ParsedAcceptHeader[] = [
      {
        mediaType: 'application/xrpl-testnet+json',
        environment: 'TESTNET',
        paymentNetwork: 'XRPL',
      },
    ]
    const expectedAddressInfo: [
      ParsedAcceptHeader,
      AddressInformation[],
      AddressInformation[],
    ] = [
      {
        mediaType: 'application/xrpl-testnet+json',
        environment: 'TESTNET',
        paymentNetwork: 'XRPL',
      },
      [addressInfo[0]],
      [verifiedAddressInfo[0]],
    ]

    // WHEN we try get get the preferred addresses for XRP payment network
    const preferredAddressInfo = getPreferredAddressHeaderPair(
      addressInfo,
      verifiedAddressInfo,
      acceptMediaTypes,
    )

    // THEN we get back the XRP addresses
    assert.deepStrictEqual(preferredAddressInfo, expectedAddressInfo)
  })

  it('Returns the second order preferred address (unverified) when the first is not found', function () {
    // GIVEN an array of addresses and array of AcceptMediaTypes
    const acceptMediaTypes: ParsedAcceptHeader[] = [
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
    const expectedAddressInfo: [
      ParsedAcceptHeader,
      AddressInformation[],
      AddressInformation[],
    ] = [
      {
        mediaType: 'application/ach+json',
        paymentNetwork: 'ACH',
      },
      [addressInfo[1]],
      [],
    ]

    // WHEN we try get get the preferred addresses for XRP, ACH payment network
    const preferredAddressInfo = getPreferredAddressHeaderPair(
      addressInfo,
      verifiedAddressInfo,
      acceptMediaTypes,
    )

    // THEN we get back the ACH addresses (because XRP was not found)
    assert.deepStrictEqual(preferredAddressInfo, expectedAddressInfo)
  })

  it('Returns the second order preferred address (verified) when the first is not found', function () {
    // GIVEN an array of addresses and array of AcceptMediaTypes
    const acceptMediaTypes: ParsedAcceptHeader[] = [
      {
        mediaType: 'application/xrpl-mainnet+json',
        environment: 'MAINNET',
        paymentNetwork: 'XRPL',
      },
      {
        mediaType: 'application/eth-kovan+json',
        environment: 'KOVAN',
        paymentNetwork: 'ETH',
      },
    ]
    const expectedAddressInfo: [
      ParsedAcceptHeader,
      AddressInformation[],
      AddressInformation[],
    ] = [
      {
        mediaType: 'application/eth-kovan+json',
        environment: 'KOVAN',
        paymentNetwork: 'ETH',
      },
      [],
      [verifiedAddressInfo[1]],
    ]

    // WHEN we try get get the preferred addresses for XRP, ACH payment network
    const preferredAddressInfo = getPreferredAddressHeaderPair(
      addressInfo,
      verifiedAddressInfo,
      acceptMediaTypes,
    )

    // THEN we get back the ACH addresses (because XRP was not found)
    assert.deepStrictEqual(preferredAddressInfo, expectedAddressInfo)
  })

  it('Returns undefined if no preferred address found', function () {
    // GIVEN an array of addresses and array of AcceptMediaTypes
    const acceptMediaTypes: ParsedAcceptHeader[] = [
      {
        mediaType: 'application/xrpl-mainnet+json',
        environment: 'MAINNET',
        paymentNetwork: 'XRPL',
      },
    ]

    // WHEN we try get get the preferred addresses for XRP network on mainnet
    const preferredAddressInfo = getPreferredAddressHeaderPair(
      addressInfo,
      verifiedAddressInfo,
      acceptMediaTypes,
    )

    // THEN we get back undefined, because XRP network on mainnet was not found
    assert.deepStrictEqual(preferredAddressInfo, [undefined, [], []])
  })
})
