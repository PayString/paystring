import { assert } from 'chai'

import 'mocha'

import { urlToPayId, constructUrl } from '../../src/services/utils'

describe('constructUrl', function (): void {
  it('returns a url from components', function (): void {
    // GIVEN a set of URL components
    const protocol = 'https'
    const hostname = 'example.com'
    const path = '/alice'
    const expectedUrl = 'https://example.com/alice'

    // WHEN we attempt converting them to a URL
    const actualUrl = constructUrl(protocol, hostname, path)

    // THEN we get our expected URL
    assert.strictEqual(actualUrl, expectedUrl)
  })

  it('returns a url with a port from components', function (): void {
    // GIVEN a set of URL components w/ a port
    const protocol = 'https'
    const hostname = 'example.com'
    const path = '/alice'
    const port = '8080'
    const expectedUrl = 'https://example.com:8080/alice'

    // WHEN we attempt converting them to a URL
    const actualUrl = constructUrl(protocol, hostname, path, port)

    // THEN we get our expected URL w/ a port
    assert.strictEqual(actualUrl, expectedUrl)
  })
})

describe('urlToPayId', function (): void {
  it('throws an error on an invalid URL', function (): void {
    // GIVEN an invalid PayID URL (multi-step path)
    const url = 'https://example.com/badPath/alice'
    const expectedErrorMessage =
      'Bad input. The only paths allowed in a PayID are to specify the user.'

    // WHEN we attempt converting it to a PayID
    const badConversion = (): string => urlToPayId(url)

    // THEN we get our expected PayID
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

describe('parsePayIdUrl', function (): void {
  it('throws an error on inputs that are not HTTP/HTTPS', function (): void {
    // GIVEN a badly formed input
    const url = 'ftp://example.com/alice'
    const expectedErrorMessage = 'Bad input. PayID URLs must be HTTP/HTTPS.'

    // WHEN we attempt converting it to a PayID
    const badConversion = (): string => urlToPayId(url)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('throws an error on inputs that are HTTP if httpsRequired is true', function (): void {
    // GIVEN an http URL
    const url = 'http://example.com/alice'
    const expectedErrorMessage = 'Bad input. PayID URLs must be HTTPS.'

    // WHEN we attempt converting it to a PayID w/ httpsRequired set to true
    const badConversion = (): string => urlToPayId(url, true)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('handles HTTP if httpsRequired is false', function (): void {
    // GIVEN an http URL
    const url = 'http://example.com/alice'
    const expectedPayId = 'alice$example.com'

    // WHEN we attempt converting it to a PayID w/ httpsRequired set to false
    const actualPayId = urlToPayId(url, false)

    // THEN we get our expected PayId
    assert.strictEqual(actualPayId, expectedPayId)
  })

  it('throws an error on inputs that are not ASCII', function (): void {
    // GIVEN a badly formed PayID URL (non-ASCII)
    // Note that this is a real TLD that exists
    const url = 'https://hansbergren.example.संगठन'
    const expectedErrorMessage = 'Bad input. PayIDs must be ASCII.'

    // WHEN we attempt converting it to a PayID
    const badConversion = (): string => urlToPayId(url)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('Rejects URL with user not immediately after tld', function (): void {
    // GIVEN a PayID URL with a path
    const url = 'https://example.com/users/alice'
    const expectedErrorMessage =
      'Bad input. The only paths allowed in a PayID are to specify the user.'

    // WHEN we attempt converting it to a PayID
    const badConversion = (): string => urlToPayId(url)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })
})
