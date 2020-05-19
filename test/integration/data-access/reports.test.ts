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
        paymentNetwork: 'ACH',
        environment: null,
        count: 1,
      },
      {
        paymentNetwork: 'BTC',
        environment: 'TESTNET',
        count: 2,
      },
      {
        paymentNetwork: 'INTERLEDGER',
        environment: 'TESTNET',
        count: 1,
      },
      {
        paymentNetwork: 'XRPL',
        environment: 'DEVNET',
        count: 1,
      },
      {
        paymentNetwork: 'XRPL',
        environment: 'MAINNET',
        count: 2,
      },
      {
        paymentNetwork: 'XRPL',
        environment: 'TESTNET',
        count: 6,
      },
    ]
    assert.deepEqual(results, expected)
  })
})
