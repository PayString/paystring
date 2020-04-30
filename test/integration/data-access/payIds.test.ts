import 'mocha'
import { assert } from 'chai'

import config from '../../../src/config'
import getPaymentInfoFromDatabase from '../../../src/data-access/payIds'
import syncDatabaseSchema from '../../../src/db/syncDatabaseSchema'
import structuredClone from '../../helpers/helpers'

describe('Data Access - getPaymentInfoFromDatabase()', function (): void {
  // Seed the database for our tests.
  before(async function () {
    const testConfig = structuredClone(config)
    testConfig.database.options.seedDatabase = true

    await syncDatabaseSchema(testConfig.database)
  })

  it('Gets payment information for a known PayID', async function () {
    // GIVEN a PayID / payment network / environment tuple known to exist in the database
    // WHEN we attempt to retrieve payment information for that tuple
    const paymentInfo = await getPaymentInfoFromDatabase(
      'alice$xpring.money',
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

  it('Returns undefined for an unknown PayID', async function () {
    // GIVEN a PayID / payment network / environment tuple known to not exist in the database
    // WHEN we attempt to retrieve payment information for that tuple
    const paymentInfo = await getPaymentInfoFromDatabase(
      'johndoe$xpring.io',
      'XRPL',
      'TESTNET',
    )

    // THEN we get back undefined
    assert.strictEqual(paymentInfo, undefined)
  })
})
