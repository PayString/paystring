import { assert } from 'chai'

import 'mocha'
import {
  parseAcceptMediaType,
  AcceptMediaType,
} from '../../src/utils/acceptHeader'
import { ParseError } from '../../src/utils/errors'

describe('parseAcceptMediaType', function (): void {
  it('Should parse a string with a valid Accept type', function () {
    // GIVEN a string with a valid Accept type
    const validAcceptMediaType = 'application/xrpl-testnet+json'

    // WHEN we attempt to parse it
    const parsedAcceptMediaType = parseAcceptMediaType(validAcceptMediaType)

    // THEN we successfully parsed the parts
    assert.strictEqual(parsedAcceptMediaType.mediaType, validAcceptMediaType)
    assert.strictEqual(parsedAcceptMediaType.paymentNetwork, 'XRPL')
    assert.strictEqual(parsedAcceptMediaType.environment, 'TESTNET')
  })

  it('Should throw an error when parsing a string with an invalid Accept type', function () {
    // GIVEN a string with an invalid Accept type
    const invalidAcceptMediaType = 'invalid-type'

    // WHEN we attempt to parse it
    const invalidMediaTypeParse = (): AcceptMediaType =>
      parseAcceptMediaType(invalidAcceptMediaType)

    // THEN we throw a ParseError
    assert.throws(
      invalidMediaTypeParse,
      ParseError,
      'Invalid Accept media type invalid-type',
    )
  })
})
