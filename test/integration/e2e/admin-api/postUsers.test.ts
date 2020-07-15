import HttpStatus from '@xpring-eng/http-status'
import * as request from 'supertest'
import 'mocha'

import App from '../../../../src/app'
import { appSetup, appCleanup } from '../../../helpers/helpers'

let app: App
const payIdApiVersion = '2020-05-28'

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
      // AND we expect back a 201 - CREATED
      .expect(HttpStatus.Created, done)
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
      // AND we expect back a 201 - CREATED
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
      // AND we expect back a 201 - CREATED
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

  after(function () {
    appCleanup(app)
  })
})
