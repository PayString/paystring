import HttpStatus from '@xpring-eng/http-status'
import * as request from 'supertest'
import 'mocha'

import App from '../../../../src/app'
import { appSetup, appCleanup } from '../../../helpers/helpers'

let app: App
const payIdApiVersion = '2020-05-28'

const acceptPatch = 'application/merge-patch+json'

describe('E2E - adminApiRouter - GET /users', function (): void {
  before(async function () {
    app = await appSetup()
  })
  // TODO:(hbergren) beforeEach seed the database. That way we always start with a clean slate, and tests aren't interdependent.

  it('Returns a 200 and correct information for a user known to exist', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$xpring.money'
    const expectedResponse = {
      payId: 'alice$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS',
          },
        },
      ],
      verifiedAddresses: [],
    }

    // WHEN we make a GET request to /users/ with that PayID as our user
    request(app.adminApiExpress)
      .get(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN We expect back a 200 - OK, with the account information
      .expect(HttpStatus.OK, expectedResponse, done)
  })

  it('Returns a 200 and correct information for a user known to have an identity key', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'verified$127.0.0.1'
    const expectedResponse = {
      payId: 'verified$127.0.0.1',
      identityKey:
        'bGV0IG1lIHNlZSB0aGVtIGNvcmdpcyBOT1cgb3IgcGF5IHRoZSBwcmljZQ==',
      addresses: [],
      verifiedAddresses: [],
    }

    // WHEN we make a GET request to /users/ with that PayID as our user
    request(app.adminApiExpress)
      .get(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN We expect back a 200 - OK, with the account information
      .expect(HttpStatus.OK, expectedResponse, done)
  })

  it('Returns a 200 and correct information for a user with an identity key and verified addresses', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'postmalone$127.0.0.1'
    const expectedResponse = {
      payId: 'postmalone$127.0.0.1',
      identityKey:
        'aGkgbXkgbmFtZSBpcyBhdXN0aW4gYW5kIEkgYW0gdGVzdGluZyB0aGluZ3M=',
      addresses: [],
      verifiedAddresses: [
        {
          paymentNetwork: 'BTC',
          environment: 'TESTNET',
          details: {
            address: '2NGZrVvZG92qGYqzTLjCAewvPZ7JE8S8VxE',
          },
          identityKeySignature:
            'TG9vayBhdCBtZSEgd29vIEknbSB0ZXN0aW5nIHRoaW5ncyBhbmQgdGhpcyBpcyBhIHNpZ25hdHVyZQ==',
        },
      ],
    }

    // WHEN we make a GET request to /users/ with that PayID as our user
    request(app.adminApiExpress)
      .get(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN We expect back a 200 - OK, with the account information
      .expect(HttpStatus.OK, expectedResponse, done)
  })

  it('Returns a 200 and correct information but no identity key for a user known to have an empty string identity key', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'emptyverified$127.0.0.1'
    const expectedResponse = {
      payId: 'emptyverified$127.0.0.1',
      addresses: [],
      verifiedAddresses: [],
    }

    // WHEN we make a GET request to /users/ with that PayID as our user
    request(app.adminApiExpress)
      .get(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN We expect back a 200 - OK, with the account information
      .expect(HttpStatus.OK, expectedResponse, done)
  })

  it('Returns a 200 and correct information for a user known to exist without any addresses', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'empty$xpring.money'
    const expectedResponse = {
      payId: 'empty$xpring.money',
      addresses: [],
      verifiedAddresses: [],
    }

    // WHEN we make a GET request to /users/ with that PayID as our user
    request(app.adminApiExpress)
      .get(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .expect('Content-Type', /json/u)
      // THEN We expect back a 200 - OK, with the account information
      .expect(HttpStatus.OK, expectedResponse, done)
  })

  it('Returns a 200 and correct information for a user known to exist, when we use an uppercase PayID', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'ALICE$XPRING.MONEY'
    const expectedResponse = {
      payId: 'alice$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'rDk7FQvkQxQQNGTtfM2Fr66s7Nm3k87vdS',
          },
        },
      ],
      verifiedAddresses: [],
    }

    // WHEN we make a GET request to /users/ with that PayID as our user
    request(app.adminApiExpress)
      .get(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN We expect back a 200 - OK, with the account information
      .expect(HttpStatus.OK, expectedResponse, done)
  })

  it('Returns a 404 for an unknown PayID', function (done): void {
    // GIVEN a PayID known to not exist on the PayID service
    const payId = 'johndoe$xpring.money'
    const expectedErrorResponse = {
      statusCode: 404,
      error: 'Not Found',
      message:
        'No information could be found for the PayID johndoe$xpring.money.',
    }

    // WHEN we make a GET request to /users/ with that PayID as our user
    request(app.adminApiExpress)
      .get(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN We expect back a 404 - Not Found, with the expected error response object
      .expect(HttpStatus.NotFound, expectedErrorResponse, done)
  })

  after(function () {
    appCleanup(app)
  })
})
