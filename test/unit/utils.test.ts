import { assert } from 'chai'

import 'mocha'

import { payIdToUrl, urlToPayId } from '../../src/services/utils'

describe('payIdToUrl', function (): void {
  it('throws an error on inputs that clearly are not PayIDs', function (): void {
    // GIVEN a badly formed PayID (no $)
    const payId = 'alice.example.com'
    const expectedErrorMessage = 'Bad input. PayIDs must include a "$"'

    // WHEN we attempt converting it to a URL
    const badConversion = (): string => payIdToUrl(payId)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('throws an error on a PayID without a user', function (): void {
    // GIVEN a PayID without a user
    const payId = '$domain.com'
    const expectedErrorMessage =
      'Bad input. Missing a user in the format [user]$[domain.com(/path)].'

    // WHEN we attempt to convert it into a URL
    const badConversion = (): string => payIdToUrl(payId)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('throws an error on a PayID without a domain', function (): void {
    // GIVEN a PayID without a user
    const payId = 'user$'
    const expectedErrorMessage =
      'Bad input. Missing a domain in the format [user]$[domain.com(/path)].'

    // WHEN we attempt to convert it into a URL
    const badConversion = (): string => payIdToUrl(payId)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('throws an error on inputs that are not ASCII', function (): void {
    // GIVEN a badly formed PayID (non-ASCII)
    // Note that this is a real TLD that exists
    const payId = '$alice.example.संगठन'
    const expectedErrorMessage = 'Bad input. PayIDs must be ASCII.'

    // WHEN we attempt converting it to a URL
    const badConversion = (): string => payIdToUrl(payId)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('throws an error on PayID with multiple $', function (): void {
    // GIVEN a badly formed PayID (multiple $)
    const payId = 'alice$bob$example.com'
    const expectedErrorMessage = 'Bad input. PayIDs must include only one $.'

    // WHEN we attempt converting it to a URL
    const badConversion = (): string => payIdToUrl(payId)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })
  // THEN we get our expected error

  it('handles a PayID with a path', function (): void {
    // GIVEN a PayID with a path
    const payId = 'alice$example.com/payid/users'
    const expectedUrl = 'https://example.com/payid/users/alice'

    // WHEN we convert it to a URL
    const actualUrl = payIdToUrl(payId)

    // THEN we get our expected URL
    assert.strictEqual(actualUrl, expectedUrl)
  })

  it('lowercases URL from capitalized PayID', function (): void {
    // GIVEN a PayID with capital letters
    const payId = 'AlIcE$example.com'
    const expectedUrl = 'https://example.com/alice'

    // WHEN we convert it to a URL
    const actualUrl = payIdToUrl(payId)

    // THEN we get our expected URL
    assert.strictEqual(actualUrl, expectedUrl)
  })
})

describe('urlToPayId', function (): void {
  it('throws an error on inputs that clearly are not PayID URLs', function (): void {
    // GIVEN a badly formed PayID URL (no leading https://)
    const url = 'http://hansbergren.example.com'
    const expectedErrorMessage = 'Bad input. PayID URLs must be HTTPS.'

    // WHEN we attempt converting it to a PayID
    const badConversion = (): string => urlToPayId(url)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('throws an error on inputs that are not ASCII', function (): void {
    // GIVEN a badly formed PayID URL (non-ASCII)
    // Note that this is a real TLD that exists
    const url = 'https://hansbergren.example.संगठन'
    const expectedErrorMessage = 'Bad input. PayIDs must be ASCII.'

    // WHEN we attempt converting it to a URL
    const badConversion = (): string => urlToPayId(url)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('handles a PayID URL with a subdomain', function (): void {
    // GIVEN a PayID URL with a subdomain
    const url = 'https://payid.example.com/alice'
    const expectedPayId = 'alice$payid.example.com'

    // WHEN we convert it to a URL
    const actualPayId = urlToPayId(url)

    assert.strictEqual(actualPayId, expectedPayId)
    // THEN we get our expected URL
  })

  it('handles a PayID URL with capital letters', function (): void {
    // GIVEN a PayID URL with capitals
    const url = 'https://example.com/ALICE'
    const expectedPayId = 'alice$example.com'

    // WHEN we convert it to a URL
    const actualPayId = urlToPayId(url)

    // THEN we get our expected URL
    assert.strictEqual(actualPayId, expectedPayId)
  })
})
