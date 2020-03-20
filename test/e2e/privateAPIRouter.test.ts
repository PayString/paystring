import * as request from 'supertest'
import 'mocha'

import App from '../../src/app'
import knex from '../../src/db/knex'

const app = new App()

describe('E2E - privateAPIRouter - GET API', function(): void {
  // Initialize DB connection pool & Boot up Express application
  before(async function() {
    await app.init({
      log: false,
      seedDatabase: true,
    })
    knex.initialize()
  })
  // TODO:(hbergren) beforeEach seed the database. That way we always start with a clean slate, and tests aren't interdependent.

  it('Returns a 200 and correct information for a user known to exist', function(done): void {
    // GIVEN a payment pointer known to resolve to an account on the PayID service
    const paymentPointer = '$xpring.money/hansbergren'
    const expectedResponse = {
      payment_pointer: '$xpring.money/hansbergren',
      addresses: [
        {
          payment_network: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVacixsWrqyWCr98eTYP7FSzE9NwupESR4TrnijN7fccNiS',
          },
        },
      ],
    }

    // WHEN we make a GET request to /v1/users/ with that payment pointer as our user
    request(app.privateAPIExpress)
      .get(`/v1/users/${paymentPointer}`)
      .expect('Content-Type', /json/)
      // THEN We expect back a 200 - OK, with the account information
      .expect(200, expectedResponse, done)
  })

  it('Returns a 404 for an unknown payment pointer', function(done): void {
    // GIVEN a payment pointer known to not exist on the PayID service
    const paymentPointer = '$xpring.money/johndoe'
    const expectedErrorResponse = {
      statusCode: 404,
      error: 'Not Found',
      message:
        'No PayID information could be found for the payment pointer $xpring.money/johndoe.',
    }

    // WHEN we make a GET request to /v1/users/ with that payment pointer as our user
    request(app.privateAPIExpress)
      .get(`/v1/users/${paymentPointer}`)
      .expect('Content-Type', /json/)
      // THEN We expect back a 404 - Not Found, with the expected error response object
      .expect(404, expectedErrorResponse, done)
  })

  // Shut down Express application & close DB connections
  after(function() {
    app.close()
    knex.destroy()
  })
})

describe('E2E - privateAPIRouter - POST API', function(): void {
  // Initialize DB connection pool & Boot up Express application
  before(async function() {
    await app.init({
      log: false,
      seedDatabase: true,
    })
    knex.initialize()
  })

  it('Returns a 201 when creating a new user', function(done): void {
    // GIVEN a user with a payment pointer known to not exist on the PayID service
    const userInformation = {
      payment_pointer: '$xpring.money/johndoe',
      addresses: [
        {
          payment_network: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVQWr6BhgBLW2jbFyqqufgq8T9eN7KresB684ZSHKQ3oDth',
          },
        },
      ],
    }

    // WHEN we make a POST request to /v1/users with that user information
    request(app.privateAPIExpress)
      .post(`/v1/users`)
      .send(userInformation)
      .expect('Content-Type', /text\/plain/)
      // THEN we expect back a 201 - CREATED
      .expect(201, done)
  })

  it('Returns a 409 - Conflict when attempting to create a user that already exists', function(done): void {
    // GIVEN a user with a payment pointer known already on the PayID service
    const userInformation = {
      payment_pointer: '$xpring.money/hansbergren',
      addresses: [
        {
          payment_network: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVQWr6BhgBLW2jbFyqqufgq8T9eN7KresB684ZSHKQ3oDth',
          },
        },
      ],
    }

    // WHEN we make a POST request to /v1/users with that user information
    request(app.privateAPIExpress)
      .post(`/v1/users`)
      .send(userInformation)
      .expect('Content-Type', /json/)
      // THEN we expect back a 409 - CONFLICT
      .expect(409, done)
  })

  // Shut down Express application & close DB connections
  after(function() {
    app.close()
    knex.destroy()
  })
})

describe('E2E - privateAPIRouter - PUT API', function(): void {
  // Initialize DB connection pool & Boot up Express application
  before(async function() {
    await app.init({ log: false, seedDatabase: true })
    knex.initialize()
  })

  it('Returns a 200 and updated user payload when updating an address', function(done): void {
    // GIVEN a payment pointer known to resolve to an account on the PayID service
    const paymentPointer = '$xpring.money/hansbergren'
    const updatedInformation = {
      payment_pointer: '$xpring.money/hansbergren',
      addresses: [
        {
          payment_network: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }

    // WHEN we make a PUT request to /v1/users/ with the new information to update
    request(app.privateAPIExpress)
      .put(`/v1/users/${paymentPointer}`)
      .send(updatedInformation)
      .expect('Content-Type', /json/)
      // THEN we expect back a 200-OK, with the updated user information
      .expect(200, updatedInformation, done)
  })

  it('Returns a 200 and updated user payload when updating a payment pointer', function(done): void {
    // GIVEN a payment pointer known to resolve to an account on the PayID service
    const paymentPointer = '$xpring.money/hansbergren'
    const updatedInformation = {
      payment_pointer: '$xpring.money/bergren1234',
      addresses: [
        {
          payment_network: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }

    // WHEN we make a PUT request to /v1/users/ with the new information to update
    request(app.privateAPIExpress)
      .put(`/v1/users/${paymentPointer}`)
      .send(updatedInformation)
      .expect('Content-Type', /json/)
      // THEN we expect back a 200-OK, with the updated user information
      .expect(200, updatedInformation, done)
  })

  it('Returns a 400 - Bad Request with an error payload for a request with a malformed payment pointer', function(done): void {
    // GIVEN a payment pointer known to be in a bad format (missing $) and an expected error response payload
    const badPaymentPointer = 'xpring.money/hansbergren'
    const errorResponsePayload = {
      error: 'Bad Request',
      message: 'Bad input. Payment pointers must start with "$"',
      statusCode: 400,
    }

    const updatedInformation = {
      payment_pointer: '$xpring.money/bergren1234',
      addresses: [
        {
          payment_network: 'XRPL',
          environment: 'TESTNET',
          details: {
            address: 'TVZG1yJZf6QH85fPPRX1jswRYTZFg3H4um3Muu3S27SdJkr',
          },
        },
      ],
    }

    // WHEN we make a PUT request to /v1/users/ with the new information to update
    request(app.privateAPIExpress)
      .put(`/v1/users/${badPaymentPointer}`)
      .send(updatedInformation)
      .expect('Content-Type', /json/)
      // THEN we expect back a 400 - Bad Request, with the expected error payload response
      .expect(400, errorResponsePayload, done)
  })

  // Shut down Express application & close DB connections
  after(function() {
    app.close()
    knex.destroy()
  })
})

describe('E2E - privateAPIRouter - DELETE API', function(): void {
  // Initialize DB connection pool & Boot up Express application
  before(async function() {
    await app.init({ log: false, seedDatabase: true })
    knex.initialize()
  })

  it('Returns a 204 and no payload when deleting an account', function(done): void {
    // GIVEN a payment pointer known to resolve to an account on the PayID service
    const paymentPointer = '$xpring.money/hbergren'
    const missingPaymentPointerError = {
      error: 'Not Found',
      message: `No PayID information could be found for the payment pointer ${paymentPointer}.`,
      statusCode: 404,
    }

    // WHEN we make a DELETE request to /v1/users/ with the payment pointer to delete
    request(app.privateAPIExpress)
      .delete(`/v1/users/${paymentPointer}`)
      // THEN we expect back a 204-No Content, indicating successful deletion
      .expect(204)
      .then((_res) => {
        // AND subsequent GET requests to that payment pointer now return a 404
        request(app.privateAPIExpress)
          .get(`/v1/users/${paymentPointer}`)
          .expect(404, missingPaymentPointerError, done)
      })
  })

  it('Returns a 204  when attempting to delete an account that does not exist', function(done): void {
    // GIVEN a payment pointer known to not exist on the PayID service
    const paymentPointer = '$xpring.money/johndoe'

    // WHEN we make a DELETE request to /v1/users/ with the payment pointer to delete
    request(app.privateAPIExpress)
      .delete(`/v1/users/${paymentPointer}`)
      // THEN we expect back a 204 - No Content
      .expect(204, done)
  })

  // Shut down Express application & close DB connections
  after(function() {
    app.close()
    knex.destroy()
  })
})
