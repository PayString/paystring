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

  it('Returns a 200, the Allow and Accept-Patch header', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$xpring.money'
    // AND a correct Allow header
    const allowHeader = 'GET, PUT, DELETE, PATCH, OPTIONS'

    // WHEN we make an OPTIONS request to /users/:payId
    request(app.adminApiExpress)
      .options(`/users/${payId}`)
      // WITH the correct PayID-API-Version header
      .set('PayID-API-Version', payIdApiVersion)
      .expect('Content-Type', /text\/plain/u)
      // THEN we expect the Accept-Patch header value to be application/merge-patch+json
      .expect('Accept-Patch', contentType)
      // THEN we expect the Allow header to contain the correct methods
      .expect('Allow', allowHeader)
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
      // THEN we expect back a 400 - Bad Request
      .expect(HttpStatus.BadRequest, expectedErrorResponse, done)
  })

  after(function () {
    appCleanup(app)
  })
})
