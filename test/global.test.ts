/* eslint-disable mocha/no-top-level-hooks */
import 'mocha'
import logger from '../src/utils/logger'

// We can use a before block outside any describe block to execute code before any test runs.
// Here, we disable logging for all tests.
before(function () {
  logger.level = 'OFF'
})
