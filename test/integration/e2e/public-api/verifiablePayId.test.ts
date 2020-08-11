import 'mocha'

import HttpStatus from '@xpring-eng/http-status'
import { assert } from 'chai'
import * as request from 'supertest'

import App from '../../../../src/app'
import {
  PaymentInformation,
  AddressDetailsType,
} from '../../../../src/types/protocol'
import { appSetup, appCleanup } from '../../../helpers/helpers'

let app: App

describe('E2E - publicAPIRouter - Verifiable PayID', function (): void {
  // Boot up Express application and initialize DB connection pool
  before(async function () {
    app = await appSetup()
  })

  it('Returns the correct MAINNET address for a known PayID', function (done): void {
    // GIVEN a PayID known to have an associated xrpl-mainnet address
    const payId = '/johnwick'
    const acceptHeader = 'application/xrpl-mainnet+json'
    const expectedResponse: PaymentInformation = {
      addresses: [],
      payId: 'johnwick$127.0.0.1',
      verifiedAddresses: [
        {
          payload: {
            payId: 'johnwick$127.0.0.1',
            payIdAddress: {
              addressDetails: {
                address: 'rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS',
              },
              addressDetailsType: AddressDetailsType.CryptoAddress,
              environment: 'MAINNET',
              paymentNetwork: 'XRPL',
            },
          },
          signatures: [
            {
              name: 'identityKey',
              protected:
                'aGV0IG1lIHNlZSB0aGVtIGNvcmdpcyBOT1cgb3IgcGF5IHRoZSBwcmljZQ==',
              signature:
                'TG9vayBhdCBtZSEgd29vIEknbSB0ZXN0aW5nIHRoaW5ncyBhbmQgdGhpcyBpcyBhIHNpZ25hdHVyZQ==',
            },
          ],
        },
      ],
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
    const payId = '/johnwick'
    const acceptHeader = 'application/xrpl-testnet+json'
    const expectedResponse: PaymentInformation = {
      addresses: [],
      payId: 'johnwick$127.0.0.1',
      verifiedAddresses: [
        {
          payload: {
            payId: 'johnwick$127.0.0.1',
            payIdAddress: {
              addressDetails: {
                address: 'rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS',
              },
              addressDetailsType: AddressDetailsType.CryptoAddress,
              environment: 'TESTNET',
              paymentNetwork: 'XRPL',
            },
          },
          signatures: [
            {
              name: 'identityKey',
              protected:
                'aGV0IG1lIHNlZSB0aGVtIGNvcmdpcyBOT1cgb3IgcGF5IHRoZSBwcmljZQ==',
              signature:
                'TG9vayBhdCBtZSEgd29vIEknbSB0ZXN0aW5nIHRoaW5ncyBhbmQgdGhpcyBpcyBhIHNpZ25hdHVyZQ==',
            },
          ],
        },
      ],
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
    const payId = '/johnwick'
    const acceptHeader = 'application/btc-testnet+json'
    const expectedResponse: PaymentInformation = {
      addresses: [],
      payId: 'johnwick$127.0.0.1',
      verifiedAddresses: [
        {
          payload: {
            payId: 'johnwick$127.0.0.1',
            payIdAddress: {
              addressDetails: {
                address: '2NGZrVvZG92qGYqzTLjCAewvPZ7JE8S8VxE',
              },
              addressDetailsType: AddressDetailsType.CryptoAddress,
              environment: 'TESTNET',
              paymentNetwork: 'BTC',
            },
          },
          signatures: [
            {
              name: 'identityKey',
              protected:
                'aGV0IG1lIHNlZSB0aGVtIGNvcmdpcyBOT1cgb3IgcGF5IHRoZSBwcmljZQ==',
              signature:
                'TG9vayBhdCBtZSEgd29vIEknbSB0ZXN0aW5nIHRoaW5ncyBhbmQgdGhpcyBpcyBhIHNpZ25hdHVyZQ==',
            },
          ],
        },
      ],
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
    const payId = '/johnwick'
    const acceptHeader = 'application/ach+json'
    const expectedResponse: PaymentInformation = {
      addresses: [],
      payId: 'johnwick$127.0.0.1',
      verifiedAddresses: [
        {
          payload: {
            payId: 'johnwick$127.0.0.1',
            payIdAddress: {
              addressDetails: {
                accountNumber: '000123456789',
                routingNumber: '123456789',
              },
              addressDetailsType: AddressDetailsType.FiatAddress,
              paymentNetwork: 'ACH',
            },
          },
          signatures: [
            {
              name: 'identityKey',
              protected:
                'aGV0IG1lIHNlZSB0aGVtIGNvcmdpcyBOT1cgb3IgcGF5IHRoZSBwcmljZQ==',
              signature:
                'TG9vayBhdCBtZSEgd29vIEknbSB0ZXN0aW5nIHRoaW5ncyBhbmQgdGhpcyBpcyBhIHNpZ25hdHVyZQ==',
            },
          ],
        },
      ],
    }

    // WHEN we make a GET request to the public endpoint to retrieve payment info with an Accept header specifying ACH
    request(app.publicApiExpress)
      .get(payId)
      .set('PayID-Version', '1.1')
      .set('Accept', acceptHeader)
      // THEN we get back our Accept header as the Content-Type
      .expect((res) => {
        assert.strictEqual(res.get('Content-Type').split('; ')[0], acceptHeader)
      })
      // AND we get back the ACH account information associated with that PayID for ACH.
      .expect(HttpStatus.OK, expectedResponse, done)
  })

  it('Returns a 404 for a PayID without the relevant associated address', function (done): void {
    // GIVEN a known PayID that exists but does not have an associated devnet XRP address
    const payId = '/johnwick'
    const acceptHeader = 'application/xrpl-devnet+json'
    const expectedErrorResponse = {
      statusCode: 404,
      error: 'Not Found',
      message: 'Payment information for johnwick$127.0.0.1 could not be found.',
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

  // Shut down Express application and close DB connections
  after(function () {
    appCleanup(app)
  })
})
