import { assert } from 'chai'

import 'mocha'
import {
  ParsedAcceptHeader,
  parseAcceptHeaders,
} from '../../src/services/headers'
import { ParseError } from '../../src/utils/errors'

describe('Parsing - Headers - parseAcceptHeaders()', function (): void {
  it('Parses a list with a valid media type strings', function () {
    // GIVEN a string with a valid Accept type
    const validAcceptMediaType1 = 'application/xrpl-testnet+json'
    const validAcceptMediaType2 = 'application/xrpl-mainnet+json'
    const expectedParsedAcceptHeader1: ParsedAcceptHeader = {
      mediaType: validAcceptMediaType1,
      paymentNetwork: 'XRPL',
      environment: 'TESTNET',
    }
    const expectedParsedAcceptHeader2: ParsedAcceptHeader = {
      mediaType: validAcceptMediaType2,
      paymentNetwork: 'XRPL',
      environment: 'MAINNET',
    }

    // WHEN we attempt to parse it
    const parsedAcceptHeaders = parseAcceptHeaders([
      validAcceptMediaType1,
      validAcceptMediaType2,
    ])

    // THEN we successfully parsed the parts
    assert.deepStrictEqual(parsedAcceptHeaders[0], expectedParsedAcceptHeader1)
    assert.deepStrictEqual(parsedAcceptHeaders[1], expectedParsedAcceptHeader2)
  })

  it('Throws an error on an empty list of media types', function () {
    const expectedError = `Missing Accept Header. Must have an Accept header of the form "application/{payment_network}(-{environment})+json".
      Examples:
      - 'Accept: application/xrpl-mainnet+json'
      - 'Accept: application/btc-testnet+json'
      - 'Accept: application/ach+json'
      - 'Accept: application/payid+json'
      `
    // GIVEN an empty list
    // WHEN we attempt to parse it
    const invalidMediaTypeParse = (): ParsedAcceptHeader =>
      parseAcceptHeaders([])[0]

    // THEN we throw a ParseError
    assert.throws(invalidMediaTypeParse, ParseError, expectedError)
  })

  it('Throws an error if the list contains an invalid media type', function () {
    // GIVEN a string with an invalid Accept type
    const invalidAcceptMediaType = 'invalid-type'
    const validAcceptMediaType = 'application/xrpl-testnet+json'
    const expectedError = `Invalid Accept Header. Must have an Accept header of the form "application/{payment_network}(-{environment})+json".
      Examples:
      - 'Accept: application/xrpl-mainnet+json'
      - 'Accept: application/btc-testnet+json'
      - 'Accept: application/ach+json'
      - 'Accept: application/payid+json'
      `

    // WHEN we attempt to parse it
    const invalidMediaTypeParse = (): ParsedAcceptHeader =>
      parseAcceptHeaders([invalidAcceptMediaType, validAcceptMediaType])[0]

    // THEN we throw a ParseError
    assert.throws(invalidMediaTypeParse, ParseError, expectedError)
  })
})
