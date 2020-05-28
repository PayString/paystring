import 'mocha'
import { assert } from 'chai'

import knex from '../../../src/db/knex'
import {
  seedDatabase,
  getDatabaseConstraintDefinition,
} from '../../helpers/helpers'

describe('Database Schema - PayID Regex Example Table', function (): void {
  let payIdRegex: string

  before(async function () {
    await seedDatabase()

    const validPayIdConstraint = await getDatabaseConstraintDefinition(
      'valid_pay_id',
      'account',
    )

    // Extract regex from constraint definition
    const regexExtractor = /'(?<payIdRegex>.*?)'/u
    const match = regexExtractor.exec(validPayIdConstraint)
    payIdRegex = match?.groups?.payIdRegex ?? ''

    if (payIdRegex === '') {
      throw new Error('Expected payIdRegex to be defined.')
    }
  })

  it('Contains the expected number of valid PayIDs', async function () {
    // GIVEN an expected number of PayIDs that pass the PayID regex
    const EXPECTED_VALID_PAYID_COUNT = 23

    // WHEN we fetch the number of PayIDs that pass the PayID regex
    const validPayIdCount = await knex
      .count('*')
      .from('payid_examples')
      .where('pay_id', '~*', payIdRegex)
      .then(async (result) => Number(result[0].count))

    // AND the number of PayIDs with 'is_valid = true' the database table
    // (This is just a sanity check on the seeded values)
    const isValidCount = await knex
      .count('*')
      .from('payid_examples')
      .where('is_valid', true)
      .then(async (result) => Number(result[0].count))

    // THEN we expect to get our expected number of valid PayIDs
    assert.strictEqual(validPayIdCount, EXPECTED_VALID_PAYID_COUNT)
    assert.strictEqual(isValidCount, EXPECTED_VALID_PAYID_COUNT)
  })

  it('Contains the expected number of invalid PayIDs', async function () {
    // GIVEN an expected number of PayIDs that fail the PayID regex
    const EXPECTED_INVALID_PAYID_COUNT = 28

    // WHEN we fetch the number of PayIDs that fail the PayID regex
    const invalidPayIdCount = await knex
      .count('*')
      .from('payid_examples')
      .where('pay_id', '!~*', payIdRegex)
      .then(async (result) => Number(result[0].count))

    // AND the number of PayIDs with 'is_valid = false' in the database table
    const isInvalidCount = await knex
      .count('*')
      .from('payid_examples')
      .where('is_valid', false)
      .then(async (result) => Number(result[0].count))

    // // THEN we expect to get our expected number of valid PayIDs
    assert.strictEqual(invalidPayIdCount, EXPECTED_INVALID_PAYID_COUNT)
    assert.strictEqual(isInvalidCount, EXPECTED_INVALID_PAYID_COUNT)
  })
})
