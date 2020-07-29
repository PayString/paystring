import HttpStatus from '@xpring-eng/http-status'
import * as request from 'supertest'

import App from '../../../../src/app'
import { appCleanup, appSetup } from '../../../helpers/helpers'

import * as discoveryLinks from './testDiscoveryLinks.json'

let app: App
const discoveryPath = '/.well-known/webfinger'

describe('E2E - publicAPIRouter - PayID Discovery', function (): void {
  // Boot up Express application and initialize DB connection pool
  before(async function () {
    app = await appSetup()
  })

  it('Discovery query returns JRD', function (done): void {
    // GIVEN a PayID
    const payId = 'alice$wallet.com'
    const expectedResponse = {
      subject: payId,
      discoveryLinks,
    }

    // WHEN we make a GET request to the PayID Discovery endpoint
    request(app.publicApiExpress)
      .get(`${discoveryPath}?resource=${payId}`)
      // THEN we get back a JRD with subject = the PayID and all links from the discoveryLinks.json file
      .expect(HttpStatus.OK, expectedResponse, done)
  })

  it('Discovery query with no PayID in request parameter returns 400', function (done): void {
    // GIVEN no PayID for a PayID Discovery request
    const expectedErrorResponse = {
      statusCode: 400,
      error: 'Bad Request',
      message: 'A PayID must be provided in the `resource` request parameter.',
    }

    // WHEN we make a GET request to the PayID Discovery endpoint with no `resource` request parameter
    request(app.publicApiExpress)
      .get(discoveryPath)
      // THEN we get back a 400 with the expected error message
      .expect(HttpStatus.BadRequest, expectedErrorResponse, done)
  })

  after(function () {
    appCleanup(app)
  })
})
