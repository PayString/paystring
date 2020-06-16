import { assert } from 'chai'

import 'mocha'
import {
  ParsedAcceptHeader,
  parseAcceptHeader,
} from '../../src/services/headers'
import { ParseError } from '../../src/utils/errors'

describe('Parsing - Headers - parseAcceptHeader()', function (): void {
  it('Parses a string with a valid media type', function () {
    // GIVEN a string with a valid Accept type
    const validAcceptMediaType = 'application/xrpl-testnet+json'
    const expectedParsedAcceptHeader: ParsedAcceptHeader = {
      mediaType: validAcceptMediaType,
      paymentNetwork: 'XRPL',
      environment: 'TESTNET',
    }

    // WHEN we attempt to parse it
    const parsedAcceptHeader = parseAcceptHeader(validAcceptMediaType)

    // THEN we successfully parsed the parts
    assert.deepStrictEqual(parsedAcceptHeader, expectedParsedAcceptHeader)
  })

  it('Parses a string with a valid media type without an environment', function () {
    // GIVEN a string with a valid Accept type
    const validAcceptMediaType = 'application/ach+json'
    const expectedParsedAcceptHeader: ParsedAcceptHeader = {
      mediaType: validAcceptMediaType,
      paymentNetwork: 'ACH',
    }

    // WHEN we attempt to parse it
    const parsedAcceptHeader = parseAcceptHeader(validAcceptMediaType)

    // THEN we successfully parsed the parts
    assert.deepStrictEqual(parsedAcceptHeader, expectedParsedAcceptHeader)
  })

  it('Throws an error when parsing a string with an invalid media type', function () {
    // GIVEN a string with an invalid Accept type
    const invalidAcceptMediaType = 'invalid-type'

    // WHEN we attempt to parse it
    const invalidMediaTypeParse = (): ParsedAcceptHeader =>
      parseAcceptHeader(invalidAcceptMediaType)

    // THEN we throw a ParseError
    assert.throws(
      invalidMediaTypeParse,
      ParseError,
      `Invalid Accept Header. Must have an Accept header of the form "application/{payment_network}(-{environment})+json".
      Examples:
      - 'Accept: application/xrpl-mainnet+json'
      - 'Accept: application/btc-testnet+json'
      - 'Accept: application/ach+json'
      - 'Accept: application/payid+json'
      `,
    )
  })
})
