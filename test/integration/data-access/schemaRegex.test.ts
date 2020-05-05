import 'mocha'
import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

import { getAllPaymentInfoFromDatabase } from '../../../src/data-access/payIds'
import { insertUser } from '../../../src/data-access/users'

chai.use(chaiAsPromised)
const { assert } = chai

describe('E2E - privateAPIRouter - Regex', function (): void {
  const addresses = [
    {
      payment_network: 'XRPL',
      environment: 'MAINNET',
      details: {
        address: 'XV5sbjUmgPpvXv4ixFWZ5ptAYZ6PD28Sq49uo34VyjnmK5H',
      },
    },
  ]

  /**
   * specific regex we are testing:
   * constraint = valid_pay_id
   * location = src/db/migrations/02_change_pay_id_format_constraint.sql
   */

  it('Accepts PayID with a lowercase letter for user', async function (): Promise<
    void
  > {
    // GIVEN an acceptable PayID with a lowercase letter for the user
    const payId = 'a$wallet.com'

    // WHEN we attempt to insert that PayID into our DB
    await insertUser(payId, addresses)

    // THEN we expect the user to have been successfully inserted
    const resp = await getAllPaymentInfoFromDatabase(payId)
    assert.deepEqual(resp, addresses)
  })

  it('Rejects PayID with a uppercase letter for user', function (): void {
    // GIVEN an unacceptable PayID with an uppercase letter for the user
    const payId = 'A$wallet.com'

    // WHEN we attempt to insert that PayID into our DB
    const insertion = insertUser(payId, addresses)

    // THEN we expect insert to throw an error
    assert.isRejected(insertion)
  })

  it('Accepts PayID with a number for user', async function (): Promise<void> {
    // GIVEN an acceptable PayID with a number for the user
    const payId = '1$wallet.com'

    // WHEN we attempt to insert that PayID into our DB
    await insertUser(payId, addresses)

    // THEN we expect the user to have been successfully inserted
    const resp = await getAllPaymentInfoFromDatabase(payId)
    assert.deepEqual(resp, addresses)
  })

  it('Accepts PayID with a period for user', async function (): Promise<void> {
    // GIVEN an acceptable PayID with a period for the user
    const payId = '.$wallet.com'

    // WHEN we attempt to insert that PayID into our DB
    await insertUser(payId, addresses)

    // THEN we expect the user to have been successfully inserted
    const resp = await getAllPaymentInfoFromDatabase(payId)
    assert.deepEqual(resp, addresses)
  })

  it('Accepts PayID with an _ for user', async function (): Promise<void> {
    // GIVEN an acceptable PayID with an _ for the user
    const payId = '_$wallet.com'

    // WHEN we attempt to insert that PayID into our DB
    await insertUser(payId, addresses)

    // THEN we expect the user to have been successfully inserted
    const resp = await getAllPaymentInfoFromDatabase(payId)
    assert.deepEqual(resp, addresses)
  })

  it('Accepts PayID with a hyphen for user', async function (): Promise<void> {
    // GIVEN an acceptable PayID with a hypen for the user
    const payId = '-$wallet.com'

    // WHEN we attempt to insert that PayID into our DB
    await insertUser(payId, addresses)

    // THEN we expect the user to have been successfully inserted
    const resp = await getAllPaymentInfoFromDatabase(payId)
    assert.deepEqual(resp, addresses)
  })

  it('Accepts PayID with normal host', async function (): Promise<void> {
    // GIVEN an acceptable PayID with a normal host
    const payId = 'user$wallet.com'

    // WHEN we attempt to insert that PayID into our DB
    await insertUser(payId, addresses)

    // THEN we expect the user to have been successfully inserted
    const resp = await getAllPaymentInfoFromDatabase(payId)
    assert.deepEqual(resp, addresses)
  })

  it('Accepts PayID with a subdomain', async function (): Promise<void> {
    // GIVEN an acceptable PayID a subdomain
    const payId = 'user$subdomain.wallet.com'

    // WHEN we attempt to insert that PayID into our DB
    await insertUser(payId, addresses)

    // THEN we expect the user to have been successfully inserted
    const resp = await getAllPaymentInfoFromDatabase(payId)
    assert.deepEqual(resp, addresses)
  })
})
