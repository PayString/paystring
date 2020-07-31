import HttpStatus from '@xpring-eng/http-status'
import * as request from 'supertest'
import 'mocha'

import App from '../../../../src/app'
import { appSetup, appCleanup } from '../../../helpers/helpers'

let app: App
const payIdApiVersion = '2020-05-28'

const acceptPatch = 'application/merge-patch+json'

describe('E2E - adminApiRouter - PUT /users', function (): void {
  before(async function () {
    app = await appSetup()
  })

  it('Returns a 200 and updated user payload when updating an address', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$xpring.money'
    const updatedInformation = {
      payId: 'alice$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }

    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 200-OK, with the updated user information
      .expect(HttpStatus.OK, updatedInformation, done)
  })

  it('Returns a 200 and updated user payload when updating a PayID', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$xpring.money'
    const updatedInformation = {
      payId: 'charlie$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }

    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 200-OK, with the updated user information
      .expect(HttpStatus.OK, updatedInformation, done)
  })

  it('Returns a 200 and updated user payload when removing all addresses', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'empty$xpring.money'
    const updatedInformation = {
      payId: 'empty$xpring.money',
      addresses: [],
    }

    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect back a 200-OK, with the updated user information
      .expect(HttpStatus.OK, updatedInformation, done)
  })

  it('Returns a 201 and inserted user payload for a Admin API PUT creating a new user', function (done): void {
    // GIVEN a PayID known to not exist on the PayID service
    const payId = 'notjohndoe$xpring.money'
    const insertedInformation = {
      payId: 'johndoe$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }

    // WHEN we make a PUT request to /users/ with the information to insert
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(insertedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect the Location header to be set to the path of the created user resource
      // Note that the PayID inserted is that of the request body, not the URL path
      .expect('Location', `/users/${insertedInformation.payId}`)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // AND we expect back a 201 - CREATED, with the inserted user information
      .expect(HttpStatus.Created, insertedInformation, done)
  })

  it('Returns a 201 and inserted user payload for a Admin API PUT creating a new user with an uppercase PayID provided', function (done): void {
    // GIVEN a PayID known to not exist on the PayID service
    const payId = 'notjohndoe$xpring.money'
    const newPayId = 'johnsmith$xpring.money'

    const insertedInformation = {
      payId: newPayId.toUpperCase(),
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }

    // WHEN we make a PUT request to /users/ with the information to insert
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(insertedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect the Location header to be set to the path of the created user resource
      // Note that the PayID inserted is that of the request body, not the URL path, and we expect a lowercase response
      .expect('Location', `/users/${newPayId}`)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // AND we expect back a 201 - CREATED, with the inserted user information (but the PayID lowercased)
      .expect(
        HttpStatus.Created,
        { ...insertedInformation, ...{ payId: newPayId } },
        done,
      )
  })

  it('Returns a 400 - Bad Request with an error payload for a request with a malformed PayID', function (done): void {
    // GIVEN a PayID known to be in a bad format (missing $) and an expected error response payload
    const badPayId = 'alice.xpring.money'
    const expectedErrorResponse = {
      error: 'Bad Request',
      message: 'Bad input. PayIDs must contain a "$"',
      statusCode: 400,
    }
    const updatedInformation = {
      payId: 'alice$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }
    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${badPayId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 400 - Bad Request, with the expected error payload response
      .expect(HttpStatus.BadRequest, expectedErrorResponse, done)
  })

  it('Returns a 400 - Bad Request with an error payload for a request with an existing PayID with multiple "$"', function (done): void {
    // GIVEN a PayID known to be in a bad format (multiple $) and an expected error response payload
    const badPayId = 'alice$bob$xpring.money'
    const expectedErrorResponse = {
      error: 'Bad Request',
      message: 'Bad input. PayIDs must contain only one "$"',
      statusCode: 400,
    }
    const updatedInformation = {
      payId: 'alice$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }
    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${badPayId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 400 - Bad Request, with the expected error payload response
      .expect(HttpStatus.BadRequest, expectedErrorResponse, done)
  })

  it('Returns a 400 - Bad Request with an error payload for a request to update a PayID to a new value containing multiple "$"', function (done): void {
    // GIVEN a PayID known to be in a bad format (missing $) and an expected error response payload
    const badPayId = 'alice$xpring.money'
    const expectedErrorResponse = {
      error: 'Bad Request',
      message: 'Bad input. PayIDs must contain only one "$"',
      statusCode: 400,
    }
    const updatedInformation = {
      payId: 'alice$bob$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }
    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${badPayId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 400 - Bad Request, with the expected error payload response
      .expect(HttpStatus.BadRequest, expectedErrorResponse, done)
  })

  it('Returns a 409 - Conflict when attempting to update a user to a PayID that already exists', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'charlie$xpring.money'
    const updatedInformation = {
      // AND a request to update that PayID to one known to already exist on the PayID Service
      payId: 'bob$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }
    // AND our expected error response
    const expectedErrorResponse = {
      statusCode: 409,
      error: 'Conflict',
      message: 'There already exists a user with the provided PayID',
    }

    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 409 - CONFLICT and our expected error response
      .expect(HttpStatus.Conflict, expectedErrorResponse, done)
  })

  it('Returns a 409 - Conflict when attempting to PUT a new user to a PayID that already exists', function (done): void {
    // GIVEN a PayID known to not resolve to an account on the PayID service
    const payId = 'janedoe$xpring.money'
    // AND a request to update that PayID to one known to already exist on the PayID Service
    const updatedInformation = {
      payId: 'bob$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }
    // AND our expected error response
    const expectedErrorResponse = {
      statusCode: 409,
      error: 'Conflict',
      message: 'There already exists a user with the provided PayID',
    }

    // WHEN we make a PUT request to /users/ with the new information to update
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 409 - CONFLICT and our expected error response
      .expect(HttpStatus.Conflict, expectedErrorResponse, done)
  })

  it('Returns a 415 - Unsupported Media Type when sending a wrong Content-Type header', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$xpring.money'
    // We need to send the body as a String if Content-Type is not application/json.
    // Otherwise an error ERR_INVALID_ARG_TYPE will be thrown by Supertest in the send() method.
    const updatedInformation = `{
      payId: 'alice$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }`

    // AND our expected error response
    const expectedErrorResponse = {
      statusCode: 415,
      error: 'Unsupported Media Type',
      message:
        "A 'Content-Type' header is required for this request: 'Content-Type: application/json'.",
    }

    // WHEN we make a PUT request to /users/:payId with that updated user information
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      // WITH a wrong Content-Type
      .set('Content-Type', 'application/xml')
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 415 - Unsupported Media Type and our expected error response
      .expect(HttpStatus.UnsupportedMediaType, expectedErrorResponse, done)
  })

  it('Returns a 415 - Unsupported Media Type when Content-Type header is missing', function (done): void {
    // GIVEN a PayID known to resolve to an account on the PayID service
    const payId = 'alice$xpring.money'
    // We need to send the body as a String if Content-Type is not sent.
    // Otherwise Supertest will automatically add a "Content-Type: application/json" header.
    const updatedInformation = `{
      payId: 'alice$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }`

    // AND our expected error response
    const expectedErrorResponse = {
      statusCode: 415,
      error: 'Unsupported Media Type',
      message:
        "A 'Content-Type' header is required for this request: 'Content-Type: application/json'.",
    }

    // WHEN we make a PUT request to /users/:payId with that updated user information
    request(app.adminApiExpress)
      .put(`/users/${payId}`)
      // WITHOUT a Content-Type
      .set('PayID-API-Version', payIdApiVersion)
      .send(updatedInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect to have an Accept-Patch header in the response
      .expect('Accept-Patch', acceptPatch)
      // THEN we expect back a 415 - Unsupported Media Type and our expected error response
      .expect(HttpStatus.UnsupportedMediaType, expectedErrorResponse, done)
  })

  after(function () {
    appCleanup(app)
  })
})
