import * as request from 'supertest'
import 'mocha'

import App from '../../src/app'
import knex from '../../src/db/knex'

const app = new App()

describe('E2E - privateAPIRouter', function(): void {
  // Initialize DB connection pool & Boot up Express application
  before(async function() {
    await app.init({ log: false, seedDatabase: true })
    knex.initialize()
  })

  it('Returns a 200 for a private API GET', function(done): void {
    // GIVEN a payment pointer known to resolve to an account on the PayID service
    const encodedPaymentPointer = encodeURIComponent(
      'https://xpring.money/hansbergren',
    )
    const expectedResponse = {
      account_id: '223ece9c-2a15-48e1-9df6-d9ac77c5db90',
      addresses: [
        {
          currency: 'XRP',
          network: 'TESTNET',
          payment_information: {
            address: 'T7WSFgh6owANWoD2V3WRg6aeBveBzExkpDowirvnLDGL2YW',
          },
        },
      ],
    }

    // WHEN we make a request to /v1/users/ with that payment pointer as a query string parameter
    // THEN We expect back a 200-OK, with the account information
    request(app.privateAPIExpress)
      .get(`/v1/users/?payment_pointer=${encodedPaymentPointer}`)
      .expect('Content-Type', /json/)
      .expect(200, expectedResponse, done)
  })

  // Shut down Express application & close DB connections
  after(function() {
    app.close()
    knex.destroy()
  })
})
