import 'mocha'

import { assert } from 'chai'
import * as request from 'supertest'

import App from '../../../src/app'
import {
  mockInvoiceWithComplianceHashes,
  mockComplianceData,
} from '../../../src/data/travelRuleData'
import { wrapMessage } from '../../../src/services/signatureWrapper'
import {
  MessageType,
  AddressDetailType,
  ComplianceType,
  Invoice,
} from '../../../src/types/publicAPI'

import { appSetup, appCleanup, isExpectedInvoice } from './helpers'

let app: App

describe('E2E - publicAPIRouter - health check endpoint', function (): void {
  before(async function () {
    app = await appSetup()
  })

  it('Returns a 200 for a GET /status/health', function (done): void {
    request(app.publicAPIExpress).get('/status/health').expect(200, 'OK', done)
  })

  after(async function () {
    await appCleanup(app)
  })
})

describe('E2E - publicAPIRouter - GET API', function (): void {
  // Boot up Express application and initialize DB connection pool
  before(async function () {
    app = await appSetup()
  })

  it('Returns the correct MAINNET address for a known PayID', function (done): void {
    // GIVEN a PayID known to have an associated xrpl-mainnet address
    const payId = '/alice'
    const acceptHeader = 'application/xrpl-mainnet+json'
    const expectedResponse = {
      addressDetailType: 'CryptoAddressDetails',
      addressDetails: {
        address: 'X7zmKiqEhMznSXgj9cirEnD5sWo3iZSbeFRexSFN1xZ8Ktn',
      },
    }

    // WHEN we make a GET request to the public endpoint to retrieve payment info with an Accept header specifying xrpl-mainnet
    request(app.publicAPIExpress)
      .get(payId)
      .set('Accept', acceptHeader)
      // THEN we get back our Accept header as the Content-Type
      .expect((res) => {
        assert.strictEqual(res.get('Content-Type').split('; ')[0], acceptHeader)
      })
      // AND we get back the XRP address associated with that PayID for xrpl-mainnet.
      .expect(200, expectedResponse, done)
  })

  it('Returns the correct TESTNET address for a known PayID', function (done): void {
    // GIVEN a PayID known to have an associated xrpl-testnet address
    const payId = '/alice'
    const acceptHeader = 'application/xrpl-testnet+json'
    const expectedResponse = {
      addressDetailType: 'CryptoAddressDetails',
      addressDetails: {
        address: 'TVacixsWrqyWCr98eTYP7FSzE9NwupESR4TrnijN7fccNiS',
      },
    }

    // WHEN we make a GET request to the public endpoint to retrieve payment info with an Accept header specifying xrpl-testnet
    request(app.publicAPIExpress)
      .get(payId)
      .set('Accept', acceptHeader)
      // THEN we get back our Accept header as the Content-Type
      .expect((res) => {
        assert.strictEqual(res.get('Content-Type').split('; ')[0], acceptHeader)
      })
      // AND we get back the XRP address associated with that PayID for xrpl-testnet.
      .expect(200, expectedResponse, done)
  })

  it('Returns the correct address for a known PayID and a non-XRPL header', function (done): void {
    // GIVEN a PayID known to have an associated btc-testnet address
    const payId = '/alice'
    const acceptHeader = 'application/btc-testnet+json'
    const expectedResponse = {
      addressDetailType: 'CryptoAddressDetails',
      addressDetails: {
        address: 'mxNEbRXokcdJtT6sbukr1CTGVx8Tkxk3DB',
      },
    }

    // WHEN we make a GET request to the public endpoint to retrieve payment info with an Accept header specifying btc-testnet
    request(app.publicAPIExpress)
      .get(payId)
      .set('Accept', acceptHeader)
      // THEN we get back our Accept header as the Content-Type
      .expect((res) => {
        assert.strictEqual(res.get('Content-Type').split('; ')[0], acceptHeader)
      })
      // AND we get back the BTC address associated with that PayID for btc-testnet.
      .expect(200, expectedResponse, done)
  })

  it('Returns the correct address for a known PayID and an ACH header (no environment)', function (done): void {
    // GIVEN a PayID known to have an associated ACH address
    const payId = '/alice'
    const acceptHeader = 'application/ach+json'
    const expectedResponse = {
      addressDetailType: 'AchAddressDetails',
      addressDetails: {
        accountNumber: '000123456789',
        routingNumber: '123456789',
      },
    }

    // WHEN we make a GET request to the public endpoint to retrieve payment info with an Accept header specifying ACH
    request(app.publicAPIExpress)
      .get(payId)
      .set('Accept', acceptHeader)
      // THEN we get back our Accept header as the Content-Type
      .expect((res) => {
        assert.strictEqual(res.get('Content-Type').split('; ')[0], acceptHeader)
      })
      // AND we get back the ACH account information associated with that PayID for ACH.
      .expect(200, expectedResponse, done)
  })

  it('Returns a 404 with the correct error response object for an unknown PayID', function (done): void {
    // GIVEN a PayID known to not exist in the database
    const payId = '/johndoe'
    const acceptHeader = 'application/xrpl-testnet+json'
    const expectedErrorResponse = {
      statusCode: 404,
      error: 'Not Found',
      message:
        'Payment information for johndoe$127.0.0.1 in XRPL on TESTNET could not be found.',
    }

    // WHEN we make a GET request to the public endpoint to retrieve payment info with an Accept header specifying xrpl-testnet
    request(app.publicAPIExpress)
      .get(payId)
      .set('Accept', acceptHeader)
      .expect('Content-Type', /application\/json/u)
      // THEN we get back a 404 with the expected error response.
      .expect(404, expectedErrorResponse, done)
  })

  it('Returns a 404 for an PayID without the relevant associated address', function (done): void {
    // GIVEN a known PayID that exists but does not have an associated devnet XRP address
    const payId = '/alice'
    const acceptHeader = 'application/xrpl-devnet+json'
    const expectedErrorResponse = {
      statusCode: 404,
      error: 'Not Found',
      message:
        'Payment information for alice$127.0.0.1 in XRPL on DEVNET could not be found.',
    }

    // WHEN we make a GET request to the public endpoint to retrieve payment info with an Accept header specifying xrpl-devnet
    request(app.publicAPIExpress)
      .get(payId)
      .set('Accept', acceptHeader)
      .expect('Content-Type', /application\/json/u)
      // THEN we get back a 404 with the expected error response.
      .expect(404, expectedErrorResponse, done)
  })

  it('Returns a mock invoice on GET /invoice', function (done): void {
    // GIVEN a PayID known to have a testnet address
    const payId = '/alice'
    const acceptHeader = 'application/xrpl-testnet+json'

    const TIME_TO_EXPIRY = 60 * 60 * 1000
    const expectedInvoice: Invoice = {
      nonce: '123',
      expirationTime: Date.now() + TIME_TO_EXPIRY,
      paymentInformation: {
        addressDetailType: AddressDetailType.CryptoAddress,
        addressDetails: {
          address: 'TVacixsWrqyWCr98eTYP7FSzE9NwupESR4TrnijN7fccNiS',
        },
        payId: 'alice$127.0.0.1',
      },
      complianceRequirements: [ComplianceType.TravelRule],
      complianceHashes: [],
    }
    const expectedResponse = wrapMessage(expectedInvoice, MessageType.Invoice)

    // WHEN we make a GET request to the public endpoint to retrieve the invoice
    request(app.publicAPIExpress)
      .get(`${payId}/invoice?nonce=123`)
      .set('Accept', acceptHeader)
      // THEN we get back a 200 - OK with the invoice
      .expect(isExpectedInvoice(expectedResponse))
      .expect(200, done)
  })

  // TODO(dino): implement this to not use mock data
  it('Returns 400 on request to GET /invoice without a nonce', function (done): void {
    // GIVEN a PayID known to have a testnet address
    const payId = '/hbergren'
    const acceptHeader = 'application/xrpl-testnet+json'
    const expectedResponse = {
      statusCode: 400,
      message: 'Missing nonce query parameter.',
      error: 'Bad Request',
    }

    // WHEN we make a GET request to the public endpoint to retrieve the invoice
    request(app.publicAPIExpress)
      .get(`${payId}/invoice`)
      .set('Accept', acceptHeader)
      // THEN we get back a 400 - Bad Request with the invoice
      .expect(400, expectedResponse, done)
  })

  // TODO(dino): implement this to not use mock data
  it('Returns an updated mock invoice on POST /invoice', function (done): void {
    // GIVEN a PayID known to have a testnet address
    const payId = '/alice'
    const expectedResponse = wrapMessage(
      mockInvoiceWithComplianceHashes,
      MessageType.Invoice,
    )

    // WHEN we make a GET request to the public endpoint to retrieve the invoice
    request(app.publicAPIExpress)
      .post(`${payId}/invoice`)
      .send(wrapMessage(mockComplianceData, MessageType.Compliance))
      .expect('Content-Type', /json/u)
      // THEN we get back the invoice
      .expect(200, expectedResponse, done)
  })

  // Shut down Express application and close DB connections
  after(async function () {
    await appCleanup(app)
  })
})
