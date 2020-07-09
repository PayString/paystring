import 'mocha'

import HttpStatus from '@xpring-eng/http-status'
import * as request from 'supertest'

import App from '../../../../src/app'
import { appSetup, appCleanup } from '../../../helpers/helpers'

let app: App

describe('E2E - publicAPIRouter - Health Check', function (): void {
  before(async function () {
    app = await appSetup()
  })

  it('Returns a 200 - OK for a GET /status/health', function (done): void {
    request(app.publicApiExpress)
      .get('/status/health')
      .expect(HttpStatus.OK, 'OK', done)
  })

  after(function () {
    appCleanup(app)
  })
})
