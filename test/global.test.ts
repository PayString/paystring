/* eslint-disable mocha/no-top-level-hooks --
 * This is the file specifically for top-level hooks to run before/after ALL tests.
 */
import 'mocha'
import knex from '../src/db/knex'
import logger from '../src/utils/logger'

// We can use a before block outside any describe block to execute code before any test runs.
// Here, we disable logging for all tests.
before(function () {
  logger.level = 'OFF'
})

// Close DB connections after all tests are run
after(async function () {
  await knex.destroy()
})
