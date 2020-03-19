import 'mocha'
import { assert } from 'chai'
import * as request from 'supertest'

import App from '../../src/app'
import knex from '../../src/db/knex'

const app = new App()

describe('E2E - publicAPIRouter', function(): void {
  // Boot up Express application and initialize DB connection pool
  before(async function() {
    await app.init({ log: false, seedDatabase: true })
    knex.initialize()
  })

  it('Returns a 200 for a GET /status/health', function(done): void {
    request(app.publicAPIExpress)
      .get('/status/health')
      .expect(200, 'OK', done)
  })

  it('Returns the correct MAINNET address for a known payment pointer', function(done): void {
    // GIVEN a payment pointer known to have an associated xrpl-mainnet address
    const paymentPointer = '/hbergren'
    const acceptHeader = 'application/xrpl-mainnet+json'
    const expectedResponse = {
      addressDetailType: 'CryptoAddressDetails',
      addressDetails: {
        address: 'X7zmKiqEhMznSXgj9cirEnD5sWo3iZSbeFRexSFN1xZ8Ktn',
      },
    }

    // WHEN we make a GET request to the public endpoint to retrieve payment info with an Accept header specifying xrpl-mainnet
    request(app.publicAPIExpress)
      .get(paymentPointer)
      .set('Accept', acceptHeader)
      // THEN we get back our Accept header as the Content-Type
      .expect((res) => {
        assert.strictEqual(res.get('Content-Type').split('; ')[0], acceptHeader)
      })
      // AND we get back the XRP address associated with that payment pointer for xrpl-mainnet.
      .expect(200, expectedResponse, done)
  })

  it('Returns the correct TESTNET address for a known payment pointer', function(done): void {
    // GIVEN a payment pointer known to have an associated xrpl-testnet address
    const paymentPointer = '/hbergren'
    const acceptHeader = 'application/xrpl-testnet+json'
    const expectedResponse = {
      addressDetailType: 'CryptoAddressDetails',
      addressDetails: {
        address: 'TVacixsWrqyWCr98eTYP7FSzE9NwupESR4TrnijN7fccNiS',
      },
    }

    // WHEN we make a GET request to the public endpoint to retrieve payment info with an Accept header specifying xrpl-testnet
    request(app.publicAPIExpress)
      .get(paymentPointer)
      .set('Accept', acceptHeader)
      // THEN we get back our Accept header as the Content-Type
      .expect((res) => {
        assert.strictEqual(res.get('Content-Type').split('; ')[0], acceptHeader)
      })
      // AND we get back the XRP address associated with that payment pointer for xrpl-testnet.
      .expect(200, expectedResponse, done)
  })

  // Shut down Express application and close DB connections
  after(function() {
    app.close()
    knex.destroy()
  })
})
