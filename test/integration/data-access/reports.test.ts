import 'mocha'
import { assert } from 'chai'

import getPayIdCounts from '../../../src/data-access/reports'
import { seedDatabase } from '../../helpers/helpers'

describe('Data Access - getPayIdCounts()', function (): void {
  before(async function () {
    await seedDatabase()
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
        payment_network: 'INTERLEDGER',
        environment: 'TESTNET',
        count: 1,
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
