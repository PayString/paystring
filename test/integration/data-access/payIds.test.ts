import 'mocha'
import { assert } from 'chai'

import getAllPaymentInfoFromDatabase from '../../../src/data-access/payIds'
import { seedDatabase } from '../../helpers/helpers'

describe('Data Access - getAllPaymentInfoFromDatabase()', function (): void {
  before(async function () {
    await seedDatabase()
  })

  it('Gets payment information for a known PayID (1 address)', async function () {
    // GIVEN a PayID known to exist in the database
    // WHEN we attempt to retrieve payment information for that tuple
    const paymentInfo = await getAllPaymentInfoFromDatabase(
      'alice$xpring.money',
    )

    // THEN we get our seeded value back
    const expectedPaymentInfo = [
      {
        payment_network: 'XRPL',
        environment: 'TESTNET',
        details: {
          address: 'TVacixsWrqyWCr98eTYP7FSzE9NwupESR4TrnijN7fccNiS',
        },
      },
    ]
    assert.deepEqual(paymentInfo, expectedPaymentInfo)
  })

  it('Gets payment information for a known PayID (multiple addresses)', async function () {
    // GIVEN a PayID known to exist in the database
    // WHEN we attempt to retrieve payment information for that tuple
    const paymentInfo = await getAllPaymentInfoFromDatabase('alice$127.0.0.1')

    // THEN we get our seeded values back
    const expectedPaymentInfo = [
      {
        payment_network: 'XRPL',
        environment: 'MAINNET',
        details: {
          address: 'X7zmKiqEhMznSXgj9cirEnD5sWo3iZSbeFRexSFN1xZ8Ktn',
        },
      },
      {
        payment_network: 'XRPL',
        environment: 'TESTNET',
        details: {
          address: 'TVacixsWrqyWCr98eTYP7FSzE9NwupESR4TrnijN7fccNiS',
        },
      },
      {
        payment_network: 'BTC',
        environment: 'TESTNET',
        details: {
          address: 'mxNEbRXokcdJtT6sbukr1CTGVx8Tkxk3DB',
        },
      },
      {
        payment_network: 'ACH',
        environment: null,
        details: {
          accountNumber: '000123456789',
          routingNumber: '123456789',
        },
      },
    ]
    assert.deepEqual(paymentInfo, expectedPaymentInfo)
  })

  it('Returns empty array for an unknown PayID', async function () {
    // GIVEN a PayID known to not exist in the database
    // WHEN we attempt to retrieve payment information for that tuple
    const paymentInfo = await getAllPaymentInfoFromDatabase('johndoe$xpring.io')

    // THEN we get back an empty array
    assert.deepStrictEqual(paymentInfo, [])
  })
})
