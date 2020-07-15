import 'mocha'
import { assert } from 'chai'

import config from '../../src/config'
import { checkMetricsConfiguration } from '../../src/services/metrics'
import { structuredClone } from '../helpers/helpers'

describe('Push Metrics Configuration - checkMetricsConfiguration()', function (): void {
  it('Does not throw if pushMetrics is disabled', async function () {
    // GIVEN that pushMetrics is set to false
    const metricsConfig = structuredClone(config.metrics)
    metricsConfig.payIdCountRefreshIntervalInSeconds = 60
    metricsConfig.pushMetrics = false

    // WHEN we see if metrics configuration is valid
    const goodMetricsEnabledCheck = (): void => {
      checkMetricsConfiguration(metricsConfig)
    }

    // THEN we do not expect the check to throw
    assert.doesNotThrow(goodMetricsEnabledCheck)
  })

  it('Throws an error if payIdCountRefreshIntervalInSeconds is 0', async function () {
    // GIVEN that payIdCountRefreshIntervalInSeconds is set to 0
    const metricsConfig = structuredClone(config.metrics)
    metricsConfig.payIdCountRefreshIntervalInSeconds = 0

    // WHEN we see if metrics configuration is valid
    const goodMetricsEnabledCheck = (): void => {
      checkMetricsConfiguration(metricsConfig)
    }

    // THEN we do expect the check to throw
    assert.throws(
      goodMetricsEnabledCheck,
      'Invalid PAYID_COUNT_REFRESH_INTERVAL value: "0". Must be a positive number less than 86400 seconds. PayID count metrics will not be generated.',
    )
  })

  it('Throws an error if payIdCountRefreshIntervalInSeconds is negative', async function () {
    // GIVEN that payIdCountRefreshIntervalInSeconds is set to -1
    const metricsConfig = structuredClone(config.metrics)
    metricsConfig.payIdCountRefreshIntervalInSeconds = -1

    // WHEN we see if metrics configuration is valid
    const goodMetricsEnabledCheck = (): void => {
      checkMetricsConfiguration(metricsConfig)
    }

    // THEN we do expect the check to throw
    assert.throws(
      goodMetricsEnabledCheck,
      'Invalid PAYID_COUNT_REFRESH_INTERVAL value: "-1". Must be a positive number less than 86400 seconds. PayID count metrics will not be generated.',
    )
  })

  it('Throws an error if payIdCountRefreshIntervalInSeconds is greater than one day', async function () {
    // GIVEN that payIdCountRefreshIntervalInSeconds is set to 90000
    const metricsConfig = structuredClone(config.metrics)
    const oneDayInSeconds = 86_400
    metricsConfig.payIdCountRefreshIntervalInSeconds = oneDayInSeconds + 1

    // WHEN we see if metrics configuration is valid
    const goodMetricsEnabledCheck = (): void => {
      checkMetricsConfiguration(metricsConfig)
    }

    // THEN we do expect the check to throw
    assert.throws(
      goodMetricsEnabledCheck,
      'Invalid PAYID_COUNT_REFRESH_INTERVAL value: "86401". Must be a positive number less than 86400 seconds. PayID count metrics will not be generated.',
    )
  })

  it('Throws an error if gatewayUrl is an invalid URL', async function () {
    // GIVEN that pushMetrics is set to true
    const metricsConfig = structuredClone(config.metrics)
    metricsConfig.pushMetrics = true

    // AND that gatewayURL is an invalid URL
    metricsConfig.gatewayUrl = 'abc'

    // WHEN we check if metrics configuration is valid
    const badMetricsEnabledCheck = (): void => {
      checkMetricsConfiguration(metricsConfig)
    }

    // THEN we get our expected error message
    assert.throws(
      badMetricsEnabledCheck,
      'Push metrics are enabled, but the environment variable PUSH_GATEWAY_URL is not a valid url: "abc".',
    )
  })

  it('Throws an error if organization is an empty string', async function () {
    // GIVEN that pushMetrics is set to true
    const metricsConfig = structuredClone(config.metrics)
    metricsConfig.pushMetrics = true
    metricsConfig.gatewayUrl = 'https://example.com/'
    // AND that organization is an empty string
    metricsConfig.domain = ''

    // WHEN we check if metrics configuration is valid
    const badMetricsEnabledCheck = (): void => {
      checkMetricsConfiguration(metricsConfig)
    }

    // THEN we get our expected error message
    assert.throws(
      badMetricsEnabledCheck,
      `Push metrics are enabled, but the environment variable PAYID_DOMAIN is not a valid url: ""`,
    )
  })

  it('Throws an error if pushIntervalInSeconds is set to 0', async function () {
    // GIVEN that pushMetrics is set to true
    const metricsConfig = structuredClone(config.metrics)
    metricsConfig.pushMetrics = true
    metricsConfig.gatewayUrl = 'https://example.com/'
    metricsConfig.domain = 'example.com'
    // AND that pushIntervalInSeconds is set to 0
    metricsConfig.pushIntervalInSeconds = 0

    // WHEN we check if metrics configuration is valid
    const badMetricsEnabledCheck = (): void => {
      checkMetricsConfiguration(metricsConfig)
    }

    // THEN we get our expected error message
    assert.throws(
      badMetricsEnabledCheck,
      'Push metrics are enabled, but the environment variable PUSH_METRICS_INTERVAL has an invalid value: "0". Must be positive and less than one day in seconds.',
    )
  })

  it('Throws an error if pushIntervalInSeconds is set to a negative number', async function () {
    // GIVEN that pushMetrics is set to true
    const metricsConfig = structuredClone(config.metrics)
    metricsConfig.pushMetrics = true
    metricsConfig.gatewayUrl = 'https://example.com/'
    metricsConfig.domain = 'example.com'
    // AND that pushIntervalInSeconds is set to -1
    metricsConfig.pushIntervalInSeconds = -1

    // WHEN we check if metrics configuration is valid
    const badMetricsEnabledCheck = (): void => {
      checkMetricsConfiguration(metricsConfig)
    }

    // THEN we get our expected error message
    assert.throws(
      badMetricsEnabledCheck,
      'Push metrics are enabled, but the environment variable PUSH_METRICS_INTERVAL has an invalid value: "-1". Must be positive and less than one day in seconds.',
    )
  })

  it('Throws an error if pushIntervalInSeconds is set longer than one day', async function () {
    // GIVEN that pushMetrics is set to true
    const metricsConfig = structuredClone(config.metrics)
    metricsConfig.pushMetrics = true
    metricsConfig.gatewayUrl = 'https://example.com/'
    metricsConfig.domain = 'example.com'
    // AND that pushIntervalInSeconds is set to longer than one day
    const oneDayInSeconds = 86400
    metricsConfig.pushIntervalInSeconds = oneDayInSeconds + 1

    // WHEN we check if metrics configuration is valid
    const badMetricsEnabledCheck = (): void => {
      checkMetricsConfiguration(metricsConfig)
    }

    // THEN we get our expected error message
    assert.throws(
      badMetricsEnabledCheck,
      'Push metrics are enabled, but the environment variable PUSH_METRICS_INTERVAL has an invalid value: "86401". Must be positive and less than one day in seconds.',
    )
  })
})
