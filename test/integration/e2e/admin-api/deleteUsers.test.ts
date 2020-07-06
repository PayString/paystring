import HttpStatus from '@xpring-eng/http-status'
import * as request from 'supertest'
import 'mocha'

import App from '../../../../src/app'
import { appSetup, appCleanup } from '../../../helpers/helpers'

let app: App
const payIdApiVersion = '2020-05-28'

describe('E2E - adminApiRouter - DELETE /users', function (): void {
  before(async function () {
    app = await appSetup()
  })

  it('Returns a 204 and no payload when deleting an account', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$xpring.money'
    const missingPayIdError = {
      error: 'Not Found',
      message: `No information could be found for the PayID ${payId}.`,
      statusCode: 404,
    }

    // WHEN we make a DELETE request to /users/ with the PayID to delete
    request(app.adminApiExpress)
      .delete(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      // THEN we expect back a 204-No Content, indicating successful deletion
      .expect(HttpStatus.NoContent)
      .then((_res) => {
        // AND subsequent GET requests to that PayID now return a 404
        request(app.adminApiExpress)
          .get(`/users/${payId}`)
          .set('PayID-API-Version', payIdApiVersion)
          .expect(HttpStatus.NotFound, missingPayIdError, done)
      })
      .catch((err) => {
        done(err)
      })
  })

  it('Returns a 204 and no payload when deleting an account given an uppercase PayID', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'BOB$XPRING.MONEY'
    const missingPayIdError = {
      error: 'Not Found',
      message: `No information could be found for the PayID ${payId.toLowerCase()}.`,
      statusCode: 404,
    }

    // WHEN we make a DELETE request to /users/ with the PayID to delete
    request(app.adminApiExpress)
      .delete(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      // THEN we expect back a 204-No Content, indicating successful deletion
      .expect(HttpStatus.NoContent)
      .then((_res) => {
        // AND subsequent GET requests to that PayID now return a 404
        request(app.adminApiExpress)
          .get(`/users/${payId.toLowerCase()}`)
          .set('PayID-API-Version', payIdApiVersion)
          .expect(HttpStatus.NotFound, missingPayIdError, done)
      })
      .catch((err) => {
        done(err)
      })
  })

  it('Returns a 204  when attempting to delete an account that does not exist', function (done): void {
    // GIVEN a PayID known to not exist on the PayID service
    const payId = 'johndoe$xpring.money'

    // WHEN we make a DELETE request to /users/ with the PayID to delete
    request(app.adminApiExpress)
      .delete(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      // THEN we expect back a 204 - No Content
      .expect(HttpStatus.NoContent, done)
  })

  after(function () {
    appCleanup(app)
  })
})
