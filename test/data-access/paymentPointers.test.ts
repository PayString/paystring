import 'mocha'
import { assert } from 'chai'

import knex from '../../src/db/knex'
import syncDatabaseSchema from '../../src/db/syncDatabaseSchema'
import getPaymentInfoFromDatabase from '../../src/services/paymentPointers'

describe('Data Access - getPaymentInfoFromPaymentPointer()', function (): void {
  // Seed the database for our tests.
  before(async function () {
    await syncDatabaseSchema({ logQueries: false, seedDatabase: true })
  })

  it('Gets payment information for a known payment pointer', async function () {
    // GIVEN a payment pointer / payment network / environment tuple known to exist in the database
    // WHEN we attempt to retrieve payment information for that tuple
    const paymentInfo = await getPaymentInfoFromDatabase(
      'https://xpring.money/hansbergren',
      'XRPL',
      'TESTNET',
    )

    // THEN we get our seeded value back
    const expectedPaymentInfo = {
      payment_network: 'XRPL',
      environment: 'TESTNET',
      details: {
        address: 'TVacixsWrqyWCr98eTYP7FSzE9NwupESR4TrnijN7fccNiS',
      },
    }
    assert.deepEqual(paymentInfo, expectedPaymentInfo)
  })

  it('Returns undefined for an unknown payment pointer', async function () {
    // GIVEN a payment pointer / payment network / environment tuple known to not exist in the database
    // WHEN we attempt to retrieve payment information for that tuple
    const paymentInfo = await getPaymentInfoFromDatabase(
      'https://xpring.io/johndoe',
      'XRPL',
      'TESTNET',
    )

    // THEN we get back undefined
    assert.strictEqual(paymentInfo, undefined)
  })

  // Close DB connections after all tests are run
  after(function () {
    knex.destroy()
  })
})
