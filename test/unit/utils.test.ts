import { assert } from 'chai'

import 'mocha'

import {
  paymentPointerToUrl,
  urlToPaymentPointer,
} from '../../src/services/utils'

describe('paymentPointerToUrl', function(): void {
  it('throws an error on inputs that clearly are not payment pointers', function(): void {
    // GIVEN a badly formed payment pointer (no leading $)
    const paymentPointer = 'hansbergren.example.com'
    const expectedErrorMessage =
      'Bad input. Payment pointers must start with "$"'

    // WHEN we attempt converting it to a URL
    const badConversion = (): string => paymentPointerToUrl(paymentPointer)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('throws an error on inputs that are not ASCII', function(): void {
    // GIVEN a badly formed payment pointer (non-ASCII)
    // Note that this is a real TLD that exists
    const paymentPointer = '$hansbergren.example.संगठन'
    const expectedErrorMessage = 'Bad input. Payment pointers must be ASCII.'

    // WHEN we attempt converting it to a URL
    const badConversion = (): string => paymentPointerToUrl(paymentPointer)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('handles a subdomained payment pointer', function(): void {
    // GIVEN a payment pointer with a subdomain
    const paymentPointer = '$hansbergren.example.com'
    const expectedUrl = 'https://hansbergren.example.com/.well-known/pay'

    // WHEN we convert it to a URL
    const actualUrl = paymentPointerToUrl(paymentPointer)

    // THEN we get our expected URL
    assert.strictEqual(actualUrl, expectedUrl)
  })

  it('handles a payment pointer with no subdomain or path', function(): void {
    // GIVEN a payment pointer without a subdomain
    const paymentPointer = '$example.com'
    const expectedUrl = 'https://example.com/.well-known/pay'

    // WHEN we convert it to a URL
    const actualUrl = paymentPointerToUrl(paymentPointer)

    // THEN we get our expected URL
    assert.strictEqual(actualUrl, expectedUrl)
  })

  it('handles a payment pointer with a path', function(): void {
    // GIVEN a payment pointer with a path
    const paymentPointer = '$example.com/hansbergren'
    const expectedUrl = 'https://example.com/hansbergren'

    // WHEN we convert it to a URL
    const actualUrl = paymentPointerToUrl(paymentPointer)

    // THEN we get our expected URL
    assert.strictEqual(actualUrl, expectedUrl)
  })
})

describe('urlToPaymentPointer', function(): void {
  it('throws an error on inputs that clearly are not payment pointer URLs', function(): void {
    // GIVEN a badly formed payment pointer URL (no leading https://)
    const url = 'http://hansbergren.example.com'
    const expectedErrorMessage =
      'Bad input. Payment pointer URLs must be HTTPS.'

    // WHEN we attempt converting it to a payment pointer
    const badConversion = (): string => urlToPaymentPointer(url)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('throws an error on inputs that are not ASCII', function(): void {
    // GIVEN a badly formed payment pointer URL (non-ASCII)
    // Note that this is a real TLD that exists
    const url = 'https://hansbergren.example.संगठन'
    const expectedErrorMessage = 'Bad input. Payment pointers must be ASCII.'

    // WHEN we attempt converting it to a URL
    const badConversion = (): string => urlToPaymentPointer(url)

    // THEN we get our expected error
    assert.throws(badConversion, expectedErrorMessage)
  })

  it('handles a "well known" subdomained payment pointer URL', function(): void {
    // GIVEN a "well known" payment pointer URL with a subdomain
    const url = 'https://hansbergren.example.com/.well-known/pay'
    const expectedPaymentPointer = '$hansbergren.example.com'

    // WHEN we convert it to a payment pointer
    const actualPaymentPointer = urlToPaymentPointer(url)

    // THEN we get our expected payment pointer
    assert.strictEqual(actualPaymentPointer, expectedPaymentPointer)
  })

  it('handles a "well known" payment pointer URL with no subdomain', function(): void {
    // GIVEN a "well known" payment pointer URL with no subdomain
    const url = 'https://example.com/.well-known/pay'
    const expectedPaymentPointer = '$example.com'

    // WHEN we convert it to a URL
    const actualPaymentPointer = urlToPaymentPointer(url)

    // THEN we get our expected URL
    assert.strictEqual(actualPaymentPointer, expectedPaymentPointer)
  })

  it('handles a payment pointer URL with a path', function(): void {
    // GIVEN a payment pointer URL with a subdomain
    const url = 'https://example.com/hansbergren'
    const expectedPaymentPointer = '$example.com/hansbergren'

    // WHEN we convert it to a URL
    const actualPaymentPointer = urlToPaymentPointer(url)

    assert.strictEqual(actualPaymentPointer, expectedPaymentPointer)
    // THEN we get our expected URL
  })
})
