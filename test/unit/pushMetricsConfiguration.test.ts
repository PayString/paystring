import 'mocha'
import { assert } from 'chai'

import config from '../../src/config'
import { scheduleRecurringMetricsPush } from '../../src/services/metrics'
import { structuredClone } from '../helpers/helpers'

let recurringPushMetricsTimeout: NodeJS.Timeout | undefined

describe('Push Metrics Configuration - scheduleRecurringMetricsPush()', function (): void {
  afterEach(function () {
    // If we successfully scheduled metrics,
    // clear the timeout after each test.
    if (recurringPushMetricsTimeout?.hasRef()) {
      clearInterval(recurringPushMetricsTimeout.ref())
    }
  })

  it('Returns undefined if reportMetrics is false', async function () {
    // GIVEN that reportMetrics is set to false
    const metricsConfig = structuredClone(config.metrics)
    metricsConfig.reportMetrics = false

    // WHEN we attempt to schedule recurring push metrics
    const recurringMetricsPushTimeout = scheduleRecurringMetricsPush(
      metricsConfig,
    )

    // THEN we get "undefined" as our return value
    assert.strictEqual(recurringMetricsPushTimeout, undefined)
  })

  it('Throws an error if gatewayUrl is an invalid URL', async function () {
    // GIVEN that reportMetrics is set to true
    const metricsConfig = structuredClone(config.metrics)
    metricsConfig.reportMetrics = true
    // AND that gatewayURL is an invalid URL
    metricsConfig.gatewayUrl = 'abc'

    // WHEN we check if push metrics are enabled
    const badMetricsEnabledCheck = (): void => {
      recurringPushMetricsTimeout = scheduleRecurringMetricsPush(metricsConfig)
    }

    // THEN we get our expected error message
    assert.throws(
      badMetricsEnabledCheck,
      'Push metrics are enabled, but the environment variable PUSH_GATEWAY_URL is not a valid url: "abc".',
    )
  })

  it('Throws an error if organization is undefined', async function () {
    // GIVEN that reportMetrics is set to true
    const metricsConfig = structuredClone(config.metrics)
    metricsConfig.reportMetrics = true
    metricsConfig.gatewayUrl = 'https://example.com/'
    // AND that organization is undefined
    metricsConfig.organization = undefined

    // WHEN we check if push metrics are enabled
    const badMetricsEnabledCheck = (): void => {
      recurringPushMetricsTimeout = scheduleRecurringMetricsPush(metricsConfig)
    }

    // THEN we get our expected error message
    assert.throws(
      badMetricsEnabledCheck,
      `
      Push metrics are enabled, but the environment variable PAYID_ORG is not set.
      Please set PAYID_ORG to the domain your PayID server is running on, like "example.com",
      or you can disable pushing metrics by setting PUSH_PAYID_METRICS to false.

      Metrics only capture the total number of PayIDs by (paymentNetwork, environment),
      and the (paymentNetwork, environment) of requests to the PayID server.
      No identifying information is captured.
      `,
    )
  })

  it('Throws an error if organization is an empty string', async function () {
    // GIVEN that reportMetrics is set to true
    const metricsConfig = structuredClone(config.metrics)
    metricsConfig.reportMetrics = true
    metricsConfig.gatewayUrl = 'https://example.com/'
    // AND that organization is an empty string
    metricsConfig.organization = ''

    // WHEN we check if push metrics are enabled
    const badMetricsEnabledCheck = (): void => {
      recurringPushMetricsTimeout = scheduleRecurringMetricsPush(metricsConfig)
    }

    // THEN we get our expected error message
    assert.throws(
      badMetricsEnabledCheck,
      `Push metrics are enabled, but the environment variable PAYID_ORG is not set.
      Please set PAYID_ORG to the domain your PayID server is running on, like "example.com",
      or you can disable pushing metrics by setting PUSH_PAYID_METRICS to false.

      Metrics only capture the total number of PayIDs by (paymentNetwork, environment),
      and the (paymentNetwork, environment) of requests to the PayID server.
      No identifying information is captured.`,
    )
  })

  it('Throws an error if pushIntervalInSeconds is set to 0', async function () {
    // GIVEN that reportMetrics is set to true
    const metricsConfig = structuredClone(config.metrics)
    metricsConfig.reportMetrics = true
    metricsConfig.gatewayUrl = 'https://example.com/'
    // AND that pushIntervalInSeconds is set to 0
    metricsConfig.pushIntervalInSeconds = 0

    // WHEN we check if push metrics are enabled
    const badMetricsEnabledCheck = (): void => {
      recurringPushMetricsTimeout = scheduleRecurringMetricsPush(metricsConfig)
    }

    // THEN we get our expected error message
    assert.throws(
      badMetricsEnabledCheck,
      'Push metrics are enabled, but the environment variable PAYID_ORG is not set.',
    )
  })

  it('Throws an error if pushIntervalInSeconds is set to a negative number', async function () {
    // GIVEN that reportMetrics is set to true
    const metricsConfig = structuredClone(config.metrics)
    metricsConfig.reportMetrics = true
    metricsConfig.gatewayUrl = 'https://example.com/'
    metricsConfig.organization = 'example.com'
    // AND that pushIntervalInSeconds is set to -1
    metricsConfig.pushIntervalInSeconds = -1

    // WHEN we check if push metrics are enabled
    const badMetricsEnabledCheck = (): void => {
      recurringPushMetricsTimeout = scheduleRecurringMetricsPush(metricsConfig)
    }

    // THEN we get our expected error message
    assert.throws(
      badMetricsEnabledCheck,
      'Push metrics are enabled, but the environment variable PUSH_METRICS_INTERVAL has an invalid value: "-1". Must be positive and less than one day in seconds.',
    )
  })

  it('Throws an error if pushIntervalInSeconds is set longer than one day', async function () {
    // GIVEN that reportMetrics is set to true
    const metricsConfig = structuredClone(config.metrics)
    metricsConfig.reportMetrics = true
    metricsConfig.gatewayUrl = 'https://example.com/'
    metricsConfig.organization = 'example.com'
    // AND that pushIntervalInSeconds is set to longer than one day
    const oneDayInSeconds = 86400
    metricsConfig.pushIntervalInSeconds = oneDayInSeconds + 1

    // WHEN we check if push metrics are enabled
    const badMetricsEnabledCheck = (): void => {
      recurringPushMetricsTimeout = scheduleRecurringMetricsPush(metricsConfig)
    }

    // THEN we get our expected error message
    assert.throws(
      badMetricsEnabledCheck,
      'Push metrics are enabled, but the environment variable PUSH_METRICS_INTERVAL has an invalid value: "86401". Must be positive and less than one day in seconds.',
    )
  })
})
