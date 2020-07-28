import 'mocha'

import HttpStatus from '@xpring-eng/http-status'
import * as request from 'supertest'

import App from '../../../../src/app'
import { appSetup, appCleanup } from '../../../helpers/helpers'

let app: App
const payIdApiVersion = '2020-05-28'

const contentType = 'application/merge-patch+json'

describe('E2E - adminApiRouter - OPTIONS /users/:payId', function (): void {
  before(async function () {
    app = await appSetup()
  })

  it('Returns a 200 with PATCH in the Allow header', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$xpring.money'

    // WHEN we make an OPTIONS request to /users/:payId
    request(app.adminApiExpress)
      .options(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      // THEN we expect the Allow header in the response
      .expect('Allow', /PATCH/u)
      // AND we expect back a 200-OK
      .expect(HttpStatus.OK, done)
  })

  it('Returns a 200 with the appropriate Accept-Patch response header', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$xpring.money'

    // WHEN we make an OPTIONS request to /users/:payId
    request(app.adminApiExpress)
      .options(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      // THEN we expect the Accept-Patch header in the response
      .expect('Accept-Patch', contentType)
      // AND we expect back a 200-OK
      .expect(HttpStatus.OK, done)
  })

  it('Returns a 400 - the PayID-API-Version header is missing', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$xpring.money'
    // AND our expected error response
    const expectedErrorResponse = {
      error: 'Bad Request',
      message:
        "A PayID-API-Version header is required in the request, of the form 'PayID-API-Version: YYYY-MM-DD'.",
      statusCode: 400,
    }

    // WHEN we make an OPTIONS request to /users/:payId
    request(app.adminApiExpress)
      .options(`/users/${payId}`)
      // WITHOUT the 'PayID-API-Version' header
      .expect('Content-Type', /json/u)
      // THEN we expect the Accept-Patch header in the response
      .expect('Accept-Patch', contentType)
      // AND we expect back a 400 - Bad Request
      .expect(HttpStatus.BadRequest, expectedErrorResponse, done)
  })

  after(function () {
    appCleanup(app)
  })
})
