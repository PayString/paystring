import HttpStatus from '@xpring-eng/http-status'
import * as request from 'supertest'
import 'mocha'

import App from '../../../../src/app'
import { appSetup, appCleanup } from '../../../helpers/helpers'

let app: App
const payIdApiVersion = '2020-05-28'

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
    }

    // WHEN we make a GET request to /users/ with that PayID as our user
    request(app.adminApiExpress)
      .get(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .expect('Content-Type', /json/u)
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
      // THEN We expect back a 404 - Not Found, with the expected error response object
      .expect(HttpStatus.NotFound, expectedErrorResponse, done)
  })

  after(function () {
    appCleanup(app)
  })
})
