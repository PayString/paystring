import { assert } from 'chai'

import 'mocha'

import { constructUrl } from '../../src/services/urls'

describe('Parsing - URLs - constructUrl()', function (): void {
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
