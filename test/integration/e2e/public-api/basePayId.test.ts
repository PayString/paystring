import 'mocha'

import HttpStatus from '@xpring-eng/http-status'
import { assert } from 'chai'
import * as request from 'supertest'

import App from '../../../../src/app'
import { appSetup, appCleanup } from '../../../helpers/helpers'

let app: App

describe('E2E - publicAPIRouter - Base PayID', function (): void {
  // Boot up Express application and initialize DB connection pool
  before(async function () {
    app = await appSetup()
  })

  it('Returns the correct MAINNET address for a known PayID', function (done): void {
    // GIVEN a PayID known to have an associated xrpl-mainnet address
    const payId = '/alice'
    const acceptHeader = 'application/xrpl-mainnet+json'
    const expectedResponse = {
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'MAINNET',
          addressDetailsType: 'CryptoAddressDetails',
          addressDetails: {
            address: 'rw2ciyaNshpHe7bCHo4bRWq6pqqynnWKQg',
            tag: '67298042',
          },
        },
      ],
      payId: 'alice$127.0.0.1',
    }

    // WHEN we make a GET request to the public endpoint to retrieve payment info with an Accept header specifying xrpl-mainnet
    request(app.publicApiExpress)
      .get(payId)
      .set('PayID-Version', '1.0')
      .set('Accept', acceptHeader)
      // THEN we get back our Accept header as the Content-Type
      .expect((res) => {
        assert.strictEqual(res.get('Content-Type').split('; ')[0], acceptHeader)
      })
      // AND we get back the XRP address associated with that PayID for xrpl-mainnet.
      .expect(HttpStatus.OK, expectedResponse, done)
  })

  it('Returns the correct TESTNET address for a known PayID', function (done): void {
    // GIVEN a PayID known to have an associated xrpl-testnet address
    const payId = '/alice'
    const acceptHeader = 'application/xrpl-testnet+json'
    const expectedResponse = {
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          addressDetailsType: 'CryptoAddressDetails',
          addressDetails: {
            address: 'rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS',
          },
        },
      ],
      payId: 'alice$127.0.0.1',
    }

    // WHEN we make a GET request to the public endpoint to retrieve payment info with an Accept header specifying xrpl-testnet
    request(app.publicApiExpress)
      .get(payId)
      .set('PayID-Version', '1.0')
      .set('Accept', acceptHeader)
      // THEN we get back our Accept header as the Content-Type
      .expect((res) => {
        assert.strictEqual(res.get('Content-Type').split('; ')[0], acceptHeader)
      })
      // AND we get back the XRP address associated with that PayID for xrpl-testnet.
      .expect(HttpStatus.OK, expectedResponse, done)
  })

  it('Returns the correct address for a known PayID and a non-XRPL header', function (done): void {
    // GIVEN a PayID known to have an associated btc-testnet address
    const payId = '/alice'
    const acceptHeader = 'application/btc-testnet+json'
    const expectedResponse = {
      addresses: [
        {
          paymentNetwork: 'BTC',
          environment: 'TESTNET',
          addressDetailsType: 'CryptoAddressDetails',
          addressDetails: {
            address: 'mxNEbRXokcdJtT6sbukr1CTGVx8Tkxk3DB',
          },
        },
      ],
      payId: 'alice$127.0.0.1',
    }

    // WHEN we make a GET request to the public endpoint to retrieve payment info with an Accept header specifying btc-testnet
    request(app.publicApiExpress)
      .get(payId)
      .set('PayID-Version', '1.0')
      .set('Accept', acceptHeader)
      // THEN we get back our Accept header as the Content-Type
      .expect((res) => {
        assert.strictEqual(res.get('Content-Type').split('; ')[0], acceptHeader)
      })
      // AND we get back the BTC address associated with that PayID for btc-testnet.
      .expect(HttpStatus.OK, expectedResponse, done)
  })

  it('Returns the correct address for a known PayID and an ACH header (no environment)', function (done): void {
    // GIVEN a PayID known to have an associated ACH address
    const payId = '/alice'
    const acceptHeader = 'application/ach+json'
    const expectedResponse = {
      addresses: [
        {
          paymentNetwork: 'ACH',
          addressDetailsType: 'FiatAddressDetails',
          addressDetails: {
            accountNumber: '000123456789',
            routingNumber: '123456789',
          },
        },
      ],
      payId: 'alice$127.0.0.1',
    }

    // WHEN we make a GET request to the public endpoint to retrieve payment info with an Accept header specifying ACH
    request(app.publicApiExpress)
      .get(payId)
      .set('PayID-Version', '1.0')
      .set('Accept', acceptHeader)
      // THEN we get back our Accept header as the Content-Type
      .expect((res) => {
        assert.strictEqual(res.get('Content-Type').split('; ')[0], acceptHeader)
      })
      // AND we get back the ACH account information associated with that PayID for ACH.
      .expect(HttpStatus.OK, expectedResponse, done)
  })

  it('Returns a 404 with the correct error response object for an unknown PayID', function (done): void {
    // GIVEN a PayID known to not exist in the database
    const payId = '/johndoe'
    const acceptHeader = 'application/xrpl-testnet+json'
    const expectedErrorResponse = {
      statusCode: 404,
      error: 'Not Found',
      message: 'Payment information for johndoe$127.0.0.1 could not be found.',
    }

    // WHEN we make a GET request to the public endpoint to retrieve payment info with an Accept header specifying xrpl-testnet
    request(app.publicApiExpress)
      .get(payId)
      .set('PayID-Version', '1.0')
      .set('Accept', acceptHeader)
      .expect('Content-Type', /application\/json/u)
      // THEN we get back a 404 with the expected error response.
      .expect(HttpStatus.NotFound, expectedErrorResponse, done)
  })

  it('Returns a 404 for a PayID without the relevant associated address', function (done): void {
    // GIVEN a known PayID that exists but does not have an associated devnet XRP address
    const payId = '/alice'
    const acceptHeader = 'application/xrpl-devnet+json'
    const expectedErrorResponse = {
      statusCode: 404,
      error: 'Not Found',
      message: 'Payment information for alice$127.0.0.1 could not be found.',
    }

    // WHEN we make a GET request to the public endpoint to retrieve payment info with an Accept header specifying xrpl-devnet
    request(app.publicApiExpress)
      .get(payId)
      .set('PayID-Version', '1.0')
      .set('Accept', acceptHeader)
      .expect('Content-Type', /application\/json/u)
      // THEN we get back a 404 with the expected error response.
      .expect(HttpStatus.NotFound, expectedErrorResponse, done)
  })

  it('Returns a 404 for a PayID request with payid+json, when that PayID has been deleted', function (done): void {
    // GIVEN a PayID known not to exist
    const payId = '/johndoe'
    const acceptHeader = 'application/payid+json'
    const expectedErrorResponse = {
      statusCode: 404,
      error: 'Not Found',
      message: 'Payment information for johndoe$127.0.0.1 could not be found.',
    }

    // WHEN we request all addresses for that PayID
    request(app.publicApiExpress)
      .get(payId)
      .set('PayID-Version', '1.0')
      .set('Accept', acceptHeader)
      // THEN we get back a 404 with the expected error response.
      .expect(HttpStatus.NotFound, expectedErrorResponse, done)
    // })
  })

  // Shut down Express application and close DB connections
  after(function () {
    appCleanup(app)
  })
})
