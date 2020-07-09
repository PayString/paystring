import 'mocha'

import HttpStatus from '@xpring-eng/http-status'
import * as request from 'supertest'

import App from '../../../../src/app'
import { appSetup, appCleanup } from '../../../helpers/helpers'

let app: App
const payIdApiVersion = '2020-05-28'

const contentType = 'application/merge-patch+json'

describe('E2E - adminApiRouter - PATCH /users/:payId', function (): void {
  before(async function () {
    app = await appSetup()
  })

  it('Returns a 201 when updating a user PayID', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$xpring.money'
    const newPayId = {
      payId: 'john$xpring.money',
    }

    // WHEN we make a PATCH request to /users/:payId with the new PayID to update
    request(app.adminApiExpress)
      .patch(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .set('Content-Type', contentType)
      .send(newPayId)
      .expect('Content-Type', /text\/plain/u)
      .expect('Accept-Patch', contentType)
      // THEN we expect the Location header to be set to the path of the created user resource
      .expect('Location', `/users/${newPayId.payId}`)
      // AND we expect back a 201-Created
      .expect(HttpStatus.Created, done)
  })

  it('Returns a 201 when updating a user PayID with an uppercase PayID', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'john$xpring.money'
    const newPayId = {
      payId: 'johnny$xpring.money'.toUpperCase(),
    }

    // WHEN we make a PATCH request to /users/:payId with the new PayID to update
    request(app.adminApiExpress)
      .patch(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .set('Content-Type', contentType)
      .send(newPayId)
      .expect('Content-Type', /text\/plain/u)
      .expect('Accept-Patch', contentType)
      // THEN we expect the Location header to be set to the path of the created user resource
      .expect('Location', `/users/${newPayId.payId.toLowerCase()}`)
      // THEN we expect back a 201 - Created
      .expect(HttpStatus.Created, done)
  })

  it('Returns a 201 when updating a user PayID with the same PayID', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'johnny$xpring.money'

    // AND a request to update that PayID with the same PayID
    const newPayId = {
      payId,
    }

    // WHEN we make a PATCH request to /users/:payId with the new PayID to update
    request(app.adminApiExpress)
      .patch(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .set('Content-Type', contentType)
      .send(newPayId)
      .expect('Content-Type', /text\/plain/u)
      .expect('Accept-Patch', contentType)
      // THEN we expect the Location header to be set to the path of the created user resource
      .expect('Location', `/users/${newPayId.payId}`)
      // THEN we expect back a 201 - Created
      .expect(HttpStatus.Created, done)
  })

  it('Returns a 400 - Bad Request with an error payload for a request with a malformed PayID', function (done): void {
    // GIVEN a PayID known to be in a bad format (missing $)
    const payId = 'johnnyxpring.money'

    // AND a request to update that PayID to one known to be new
    const newPayId = {
      payId: 'john$xpring.money',
    }

    // AND our expected error response
    const expectedErrorResponse = {
      error: 'Bad Request',
      message: 'Bad input. PayIDs must contain a "$"',
      statusCode: 400,
    }

    // WHEN we make a PATCH request to /users/:payId with the new PayID to update
    request(app.adminApiExpress)
      .patch(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .set('Content-Type', contentType)
      .send(newPayId)
      .expect('Content-Type', /json/u)
      .expect('Accept-Patch', contentType)
      // THEN we expect back a 400 - Bad Request, with the expected error payload response
      .expect(HttpStatus.BadRequest, expectedErrorResponse, done)
  })

  it('Returns a 400 - Bad Request with an error payload for a request with an existing PayID with multiple "$"', function (done): void {
    // GIVEN a PayID known to be in a bad format (missing $)
    const payId = 'johnny$bob$xpring.money'

    // AND a request to update that PayID to one known to be new
    const newPayId = {
      payId: 'john$xpring.money',
    }

    // AND our expected error response
    const expectedErrorResponse = {
      error: 'Bad Request',
      message: 'Bad input. PayIDs must contain only one "$"',
      statusCode: 400,
    }

    // WHEN we make a PATCH request to /users/:payId with the new PayID to update
    request(app.adminApiExpress)
      .patch(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .set('Content-Type', contentType)
      .send(newPayId)
      .expect('Content-Type', /json/u)
      .expect('Accept-Patch', contentType)
      // THEN we expect back a 400 - Bad Request, with the expected error payload response
      .expect(HttpStatus.BadRequest, expectedErrorResponse, done)
  })

  it('Returns a 400 - Bad Request with an error payload for a request to update a PayID to a new value containing multiple "$"', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'johnny$xpring.money'

    // AND a request to update that PayID to one known to be in a bad format (multiple $)
    const newPayId = {
      payId: 'johnny$$xpring.money',
    }

    // AND our expected error response
    const expectedErrorResponse = {
      error: 'Bad Request',
      message: 'Bad input. PayIDs must contain only one "$"',
      statusCode: 400,
    }

    // WHEN we make a PATCH request to /users/:payId with the new PayID to update
    request(app.adminApiExpress)
      .patch(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .set('Content-Type', contentType)
      .send(newPayId)
      .expect('Content-Type', /json/u)
      .expect('Accept-Patch', contentType)
      // THEN we expect back a 400 - Bad Request, with the expected error payload response
      .expect(HttpStatus.BadRequest, expectedErrorResponse, done)
  })

  it('Returns a 404 - The original user PayID does not exist', function (done): void {
    // GIVEN a PayID known to not exist on the PayID service
    const payId = 'johndoe$xpring.money'
    // AND a request to update that PayID to one known to be new
    const newPayId = {
      payId: 'john$xpring.money',
    }

    // AND our expected error response
    const expectedErrorResponse = {
      statusCode: 404,
      error: 'Not Found',
      message: `The PayID ${payId} doesn't exist.`,
    }

    // WHEN we make a PATCH request to /users/:payId with the new PayID to update
    request(app.adminApiExpress)
      .patch(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .set('Content-Type', contentType)
      .send(newPayId)
      .expect('Content-Type', /json/u)
      .expect('Accept-Patch', contentType)
      // THEN we expect back a 404 - NOT FOUND and our expected error response
      .expect(HttpStatus.NotFound, expectedErrorResponse, done)
  })

  it('Returns a 409 - Conflict when attempting to update a user to a PayID that already exists', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$127.0.0.1'
    // AND a request to update that PayID to one known to already exist on the PayID Service
    const newPayId = {
      payId: 'bob$127.0.0.1',
    }

    // AND our expected error response
    const expectedErrorResponse = {
      statusCode: 409,
      error: 'Conflict',
      message: 'There already exists a user with the provided PayID',
    }

    // WHEN we make a PATCH request to /users/:payId with the new PayID to update
    request(app.adminApiExpress)
      .patch(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .set('Content-Type', contentType)
      .send(newPayId)
      .expect('Content-Type', /json/u)
      .expect('Accept-Patch', contentType)
      // THEN we expect back a 409 - CONFLICT and our expected error response
      .expect(HttpStatus.Conflict, expectedErrorResponse, done)
  })

  it('Returns a 415 - Unsupported Media Type when omitting the Content-Type header', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$127.0.0.1'
    // AND a request to update that PayID to one known to already exist on the PayID Service
    const newPayId = {
      payId: 'chloe$127.0.0.1',
    }

    // AND our expected error response
    const expectedErrorResponse = {
      statusCode: 415,
      error: 'Unsupported Media Type',
      message:
        "A 'Content-Type' header is required for this request: 'Content-Type: application/merge-patch+json'.",
    }

    // WHEN we make a PATCH request to /users/:payId with the new PayID to update
    request(app.adminApiExpress)
      .patch(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      // WITHOUT a Content-Type header
      .send(newPayId)
      .expect('Content-Type', /json/u)
      .expect('Accept-Patch', contentType)
      // THEN we expect back a 415 - Unsupported Media Type and our expected error response
      .expect(HttpStatus.UnsupportedMediaType, expectedErrorResponse, done)
  })

  it('Returns a 415 - Unsupported Media Type when setting the Content-Type header to a wrong value', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$127.0.0.1'
    // AND a request to update that PayID with a new one in the correct format
    const newPayId = {
      payId: 'chloe$127.0.0.1',
    }

    // AND our expected error response
    const expectedErrorResponse = {
      statusCode: 415,
      error: 'Unsupported Media Type',
      message:
        "A 'Content-Type' header is required for this request: 'Content-Type: application/merge-patch+json'.",
    }

    // WHEN we make a PATCH request to /users/:payId with the new PayID to update
    request(app.adminApiExpress)
      .patch(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      // WITH a wrong Content-Type header
      .set('Content-Type', 'application/json')
      .send(newPayId)
      .expect('Content-Type', /json/u)
      .expect('Accept-Patch', contentType)
      // THEN we expect back a 415 - Unsupported Media Type and our expected error response
      .expect(HttpStatus.UnsupportedMediaType, expectedErrorResponse, done)
  })

  after(function () {
    appCleanup(app)
  })
})
