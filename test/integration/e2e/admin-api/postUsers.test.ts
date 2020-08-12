import HttpStatus from '@xpring-eng/http-status'
import { expect } from 'chai'
import * as request from 'supertest'
import 'mocha'

import App from '../../../../src/app'
import { appSetup, appCleanup } from '../../../helpers/helpers'

let app: App
const payIdApiVersion = '2020-05-28'
const acceptPatch = 'application/merge-patch+json'

describe('E2E - adminApiRouter - POST /users', function (): void {
  before(async function () {
    app = await appSetup()
  })

  it('Returns a 201 when creating a new user', function (done): void {
    // GIVEN a user with a PayID known to not exist on the PayID service
    const userInformation = {
      payId: 'johndoe$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVQWr6BhgBLW2jbFyqqufgq8T9eN7KresB684ZSHKQ3oDth',
          },
        },
        {
          paymentNetwork: 'BTC',
          environment: 'TESTNET',
          details: {
            address: 'mxNEbRXokcdJtT6sbukr1CTGVx8Tkxk3DB',
          },
        },
      ],
    }

    // WHEN we make a POST request to /users with that user information
    request(app.adminApiExpress)
      .post(`/users`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(userInformation)
      .expect('Content-Type', /text\/plain/u)
      // THEN we expect the Location header to be set to the path of the created user resource
      .expect('Location', `/users/${userInformation.payId}`)
      // THEN we expect back a 201 - CREATED
      .expect(HttpStatus.Created, done)
  })

  it('Returns a 201 when creating a new user with verifiedAddresses', function (done): void {
    // GIVEN a user with a PayID known to not exist on the PayID service
    const userInformation = {
      payId: 'harrypotter$xpring.money',
      addresses: [
        {
          paymentNetwork: 'BTC',
          environment: 'TESTNET',
          details: {
            address: 'mxNEbRXokcdJtT6sbukr1CTGVx8Tkxk3DB',
          },
        },
      ],
      verifiedAddresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVQWr6BhgBLW2jbFyqqufgq8T9eN7KresB684ZSHKQ3oDth',
          },
          identityKeySignature:
            'd2hhdCBhbSBJIGNvZGluZyB3aGF0IGlzIGxpZmUgcGxlYXNlIGhlbHA=',
        },
      ],
    }

    // WHEN we make a POST request to /users with that user information
    request(app.adminApiExpress)
      .post(`/users`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(userInformation)
      .expect('Content-Type', /text\/plain/u)
      // THEN we expect the Location header to be set to the path of the created user resource
      .expect('Location', `/users/${userInformation.payId}`)
      // THEN we expect back a 201 - CREATED
      .expect(HttpStatus.Created)
      .end(function () {
        request(app.adminApiExpress)
          .get(`/users/${userInformation.payId}`)
          .set('PayID-API-Version', payIdApiVersion)
          .expect('Content-Type', /json/u)
          // THEN we expect to have an Accept-Patch header in the response
          .expect('Accept-Patch', acceptPatch)
          // THEN We expect back a 200 - OK, with the account information
          .expect(HttpStatus.OK, userInformation, done)
      })
  })

  it('Returns a 201 when creating a new user with an identity key', function (done): void {
    const payId = 'jacksmith$xpring.money'
    const identityKey = `Imp3ayI6IHsKICAia3R5IjogIkVDIiwgCiAgInVzZSI6ICJzaWciL`

    // GIVEN a user with a PayID known to not exist on the PayID service
    const userInformation = {
      payId,
      identityKey,
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVQWr6BhgBLW2jbFyqqufgq8T9eN7KresB684ZSHKQ3oDth',
          },
        },
      ],
    }

    // WHEN we make a POST request to /users with that user information
    request(app.adminApiExpress)
      .post(`/users`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(userInformation)
      .expect('Content-Type', /text\/plain/u)
      // THEN we expect the Location header to be set to the path of the created user resource
      .expect('Location', `/users/${payId}`)
      // AND we expect back a 201 - CREATED
      .expect(HttpStatus.Created, done)
  })

  it('Returns a 201 when creating a new user, without an Accept-Patch header in the response', function (done): void {
    // GIVEN a user with a PayID known to not exist on the PayID service
    const userInformation = {
      payId: 'johnfoo$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVQWr6BhgBLW2jbFyqqufgq8T9eN7KresB684ZSHKQ3oDtq',
          },
        },
        {
          paymentNetwork: 'BTC',
          environment: 'TESTNET',
          details: {
            address: 'mxNEbRXokcdJtT6sbukr1CTGVx8Tkxk3DC',
          },
        },
      ],
    }

    // WHEN we make a POST request to /users with that user information
    request(app.adminApiExpress)
      .post(`/users`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(userInformation)
      .expect('Content-Type', /text\/plain/u)
      // THEN we expect the Location header to be set to the path of the created user resource
      .expect('Location', `/users/${userInformation.payId}`)
      // THEN we expect back a 201 - CREATED
      .expect(HttpStatus.Created)
      .end(function (err, res) {
        if (err) {
          return done(err)
        }

        // AND ensure Accept-Patch header does not exist
        expect(res.header).to.not.have.key('Accept-Patch')

        return done()
      })
  })

  it('Returns a 201 when creating a new user with an uppercase PayID', function (done): void {
    const payId = 'johnsmith$xpring.money'

    // GIVEN a user with a PayID known to not exist on the PayID service
    const userInformation = {
      payId: payId.toUpperCase(),
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVQWr6BhgBLW2jbFyqqufgq8T9eN7KresB684ZSHKQ3oDth',
          },
        },
      ],
    }

    // WHEN we make a POST request to /users with that user information
    request(app.adminApiExpress)
      .post(`/users`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(userInformation)
      .expect('Content-Type', /text\/plain/u)
      // THEN we expect the Location header to be set to the path of the created user resource
      .expect('Location', `/users/${payId}`)
      // THEN we expect back a 201 - CREATED
      .expect(HttpStatus.Created, done)
  })

  it('Returns a 201 when creating a new user with an address without an environment (ACH)', function (done): void {
    // GIVEN a user with a PayID known to not exist on the PayID service
    const userInformation = {
      payId: 'janedoe$xpring.money',
      addresses: [
        {
          paymentNetwork: 'ACH',
          details: {
            accountNumber: '000123456789',
            routingNumber: '123456789',
          },
        },
      ],
    }

    // WHEN we make a POST request to /users with that user information
    request(app.adminApiExpress)
      .post(`/users`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(userInformation)
      .expect('Content-Type', /text\/plain/u)
      // THEN we expect the Location header to be set to the path of the created user resource
      .expect('Location', `/users/${userInformation.payId}`)
      // THEN we expect back a 201 - CREATED
      .expect(HttpStatus.Created, done)
  })

  it('Returns a 201 - creates PayID containing a "."', function (done): void {
    // GIVEN a user with a PayID containing a period
    const userInformation = {
      payId: 'alice.smith$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVQWr6BhgBLW2jbFyqqufgq8T9eN7KresB684ZSHKQ3oDth',
          },
        },
      ],
    }

    // WHEN we make a POST request to /users with that user information
    request(app.adminApiExpress)
      .post(`/users`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(userInformation)
      .expect('Content-Type', /text\/plain/u)
      // THEN we expect back a 201 - CREATED
      .expect(HttpStatus.Created, done)
  })

  it('Returns a 409 - Conflict when attempting to create a user that already exists', function (done): void {
    // GIVEN a user with a PayID known already on the PayID service
    const userInformation = {
      payId: 'alice$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVQWr6BhgBLW2jbFyqqufgq8T9eN7KresB684ZSHKQ3oDth',
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

    // WHEN we make a POST request to /users with that user information
    request(app.adminApiExpress)
      .post(`/users`)
      .set('PayID-API-Version', payIdApiVersion)
      .send(userInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect back a 409 - CONFLICT and our expected error response
      .expect(HttpStatus.Conflict, expectedErrorResponse, done)
  })

  it('Returns a 415 - Unsupported Media Type when sending a wrong Content-Type header', function (done): void {
    // GIVEN our new PayID user (must be sent as a String instead of an Object if Content-Type is not application/json)
    // Otherwise an error ERR_INVALID_ARG_TYPE will be thrown by Supertest in the send() method.
    const userInformation = `{
      payId: 'johnfoo$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVQWr6BhgBLW2jbFyqqufgq8T9eN7KresB684ZSHKQ3oDtq',
          },
        },
        {
          paymentNetwork: 'BTC',
          environment: 'TESTNET',
          details: {
            address: 'mxNEbRXokcdJtT6sbukr1CTGVx8Tkxk3DC',
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

    // WHEN we make a POST request to /users with that user information
    request(app.adminApiExpress)
      .post(`/users`)
      // WITH a wrong Content-Type
      .set('Content-Type', 'application/xml')
      .set('PayID-API-Version', payIdApiVersion)
      .send(userInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect back a 415 - Unsupported Media Type and our expected error response
      .expect(HttpStatus.UnsupportedMediaType, expectedErrorResponse, done)
  })

  it('Returns a 415 - Unsupported Media Type when Content-Type header is missing', function (done): void {
    // GIVEN our new PayID user (must be sent as a String instead of an Object
    // otherwise Supertest will automatically add a "Content-Type: application/json" header.)
    const userInformation = `{
      payId: 'johnfoo$xpring.money',
      addresses: [
        {
          paymentNetwork: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVQWr6BhgBLW2jbFyqqufgq8T9eN7KresB684ZSHKQ3oDtq',
          },
        },
        {
          paymentNetwork: 'BTC',
          environment: 'TESTNET',
          details: {
            address: 'mxNEbRXokcdJtT6sbukr1CTGVx8Tkxk3DC',
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

    // WHEN we make a POST request to /users with that user information
    request(app.adminApiExpress)
      .post(`/users`)
      // WITHOUT a Content-Type
      .set('PayID-API-Version', payIdApiVersion)
      .send(userInformation)
      .expect('Content-Type', /json/u)
      // THEN we expect back a 415 - Unsupported Media Type and our expected error response
      .expect(HttpStatus.UnsupportedMediaType, expectedErrorResponse, done)
  })

  after(function () {
    appCleanup(app)
  })
})
