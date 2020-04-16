import { assert } from 'chai'

import 'mocha'

import { payIdToUrl, urlToPayId } from '../../src/services/utils'

describe('payIdToUrl', function (): void {
  it('throws an error on inputs that clearly are not payment pointers', function (): void {
    // GIVEN a badly formed payment pointer (no leading $)
    const paymentPointer = 'hansbergren.example.com'
    const expectedErrorMessage = 'Bad input. PayIDs must include a "$"'

    // WHEN we attempt converting it to a URL
    const badConversion = (): string => payIdToUrl(paymentPointer)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('throws an error on inputs that are not ASCII', function (): void {
    // GIVEN a badly formed payment pointer (non-ASCII)
    // Note that this is a real TLD that exists
    const paymentPointer = '$hansbergren.example.संगठन'
    const expectedErrorMessage = 'Bad input. PayIDs must be ASCII.'

    // WHEN we attempt converting it to a URL
    const badConversion = (): string => payIdToUrl(paymentPointer)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('handles a subdomained payment pointer', function (): void {
    // GIVEN a payment pointer with a subdomain
    const paymentPointer = '$payid.example.com/alice'
    const expectedUrl = 'https://payid.example.com/alice'

    // WHEN we convert it to a URL
    const actualUrl = payIdToUrl(paymentPointer)

    // THEN we get our expected URL
    assert.strictEqual(actualUrl, expectedUrl)
  })

  it('handles a payment pointer with a path', function (): void {
    // GIVEN a payment pointer with a path
    const paymentPointer = '$example.com/hansbergren'
    const expectedUrl = 'https://example.com/hansbergren'

    // WHEN we convert it to a URL
    const actualUrl = payIdToUrl(paymentPointer)

    // THEN we get our expected URL
    assert.strictEqual(actualUrl, expectedUrl)
  })
})

describe('urlToPayId', function (): void {
  it('throws an error on inputs that clearly are not payment pointer URLs', function (): void {
    // GIVEN a badly formed payment pointer URL (no leading https://)
    const url = 'http://hansbergren.example.com'
    const expectedErrorMessage = 'Bad input. PayID URLs must be HTTPS.'

    // WHEN we attempt converting it to a payment pointer
    const badConversion = (): string => urlToPayId(url)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('throws an error on inputs that are not ASCII', function (): void {
    // GIVEN a badly formed payment pointer URL (non-ASCII)
    // Note that this is a real TLD that exists
    const url = 'https://hansbergren.example.संगठन'
    const expectedErrorMessage = 'Bad input. PayIDs must be ASCII.'

    // WHEN we attempt converting it to a URL
    const badConversion = (): string => urlToPayId(url)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('handles a payment pointer URL with a path', function (): void {
    // GIVEN a payment pointer URL with a subdomain
    const url = 'https://example.com/hansbergren'
    const expectedPaymentPointer = '$example.com/hansbergren'

    // WHEN we convert it to a URL
    const actualPaymentPointer = urlToPayId(url)

    assert.strictEqual(actualPaymentPointer, expectedPaymentPointer)
    // THEN we get our expected URL
  })
})
