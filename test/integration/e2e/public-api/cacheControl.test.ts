import 'mocha'

import HttpStatus from '@xpring-eng/http-status'
import * as request from 'supertest'

import App from '../../../../src/app'
import config from '../../../../src/config'
import { appSetup, appCleanup } from '../../../helpers/helpers'

let app: App
const payIdServerVersion = config.app.payIdVersion

describe('E2E - publicAPIRouter - Cache Control', function (): void {
  // Boot up Express application and initialize DB connection pool
  before(async function () {
    app = await appSetup()
  })

  it('Returns a "no-store" Cache-Control header', function (done): void {
    // GIVEN a PayID known to have an associated xrpl-mainnet address
    const payId = '/alice'
    const acceptHeader = 'application/xrpl-mainnet+json'
    const payIdVersion = payIdServerVersion

    // WHEN we make a GET request specifying a supported PayID-Version header
    request(app.publicApiExpress)
      .get(payId)
      .set('PayID-Version', payIdVersion)
      .set('Accept', acceptHeader)
      // THEN we expect to get back the latest PayID version as the server version
      .expect('PayID-Server-Version', payIdServerVersion)
      // AND we expect to get back the payload using the PayID-Version we specified in the request
      .expect('PayID-Version', payIdVersion)
      // AND we expect a "no-store" Cache-Control response header
      .expect('Cache-Control', 'no-store')
      // AND we expect a 200 - OK
      .expect(HttpStatus.OK, done)
  })

  // Shut down Express application and close DB connections
  after(function () {
    appCleanup(app)
  })
})
