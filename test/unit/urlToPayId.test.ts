import { assert } from 'chai'

import 'mocha'

import { urlToPayId } from '../../src/services/urls'

describe('Parsing - URLs - urlToPayId()', function (): void {
  it('throws an error on inputs that are not HTTP/HTTPS', function (): void {
    // GIVEN a badly formed input
    const url = 'ftp://example.com/alice'
    const expectedErrorMessage =
      'Invalid PayID URL protocol. PayID URLs must be HTTP/HTTPS.'

    // WHEN we attempt converting it to a PayID
    const badConversion = (): string => urlToPayId(url)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('Handles an HTTPS PayID URL', function (): void {
    // GIVEN an http URL
    const url = 'https://example.com/alice'
    const expectedPayId = 'alice$example.com'

    // WHEN we attempt converting it to a PayID
    const actualPayId = urlToPayId(url)

    // THEN we get our expected error
    assert.strictEqual(actualPayId, expectedPayId)
  })

  it('Handles an HTTP PayID URL', function (): void {
    // GIVEN an http URL
    const url = 'http://example.com/alice'
    const expectedPayId = 'alice$example.com'

    // WHEN we attempt converting it to a PayID
    const actualPayId = urlToPayId(url)

    // THEN we get our expected PayId
    assert.strictEqual(actualPayId, expectedPayId)
  })

  it('throws an error on inputs that are not ASCII', function (): void {
    // GIVEN a badly formed PayID URL (non-ASCII)
    // Note that this is a real TLD that exists
    const url = 'https://hansbergren.example.संगठन'
    const expectedErrorMessage =
      'Invalid PayID characters. PayIDs must be ASCII.'

    // WHEN we attempt converting it to a PayID
    const badConversion = (): string => urlToPayId(url)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('throws an error on an invalid URL', function (): void {
    // GIVEN an invalid PayID URL (multi-step path)
    const url = 'https://example.com/badPath/alice'
    const expectedErrorMessage =
      'Too many paths. The only paths allowed in a PayID are to specify the user.'

    // WHEN we attempt converting it to a PayID
    const badConversion = (): string => urlToPayId(url)

    // THEN we get our expected error & error message
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('handles a PayID URL with a subdomain', function (): void {
    // GIVEN a PayID URL with a subdomain
    const url = 'https://payid.example.com/alice'
    const expectedPayId = 'alice$payid.example.com'

    // WHEN we attempt converting it to a PayID
    const actualPayId = urlToPayId(url)

    // THEN we get our expected PayID
    assert.strictEqual(actualPayId, expectedPayId)
  })

  it('handles a PayID URL with capital letters', function (): void {
    // GIVEN a PayID URL with capitals
    const url = 'https://example.com/ALICE'
    const expectedPayId = 'alice$example.com'

    // WHEN we attempt converting it to a PayID
    const actualPayId = urlToPayId(url)

    // THEN we get our expected PayID
    assert.strictEqual(actualPayId, expectedPayId)
  })
})
