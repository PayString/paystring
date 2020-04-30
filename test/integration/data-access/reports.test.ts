import 'mocha'
import { assert } from 'chai'

import config from '../../../src/config'
import getPayIdCounts from '../../../src/data-access/reports'
import syncDatabaseSchema from '../../../src/db/syncDatabaseSchema'
import structuredClone from '../../helpers/helpers'

describe('Data Access - getPayIdCounts()', function (): void {
  // Seed the database for our tests.
  before(async function () {
    const testConfig = structuredClone(config)
    testConfig.database.options.seedDatabase = true

    await syncDatabaseSchema(testConfig.database)
  })

  it('Returns a result per by unique network and environment', async function () {
    const results = await getPayIdCounts()
    const expected = [
      {
        payment_network: 'ACH',
        environment: null,
        count: 1,
      },
      {
        payment_network: 'BTC',
        environment: 'TESTNET',
        count: 2,
      },
      {
        payment_network: 'XRPL',
        environment: 'DEVNET',
        count: 1,
      },
      {
        payment_network: 'XRPL',
        environment: 'MAINNET',
        count: 2,
      },
      {
        payment_network: 'XRPL',
        environment: 'TESTNET',
        count: 6,
      },
    ]
    assert.deepEqual(results, expected)
  })
})
