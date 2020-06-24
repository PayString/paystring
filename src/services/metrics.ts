import { hostname } from 'os'

import { Counter, Gauge, Pushgateway, Registry } from 'prom-client'

import config from '../config'
import logger from '../utils/logger'

// Custom Prometheus registries.
// The default registry gets used for other metrics that we don't want to collect from partners, like memory usage.
//
// We need separate registries so the gauge metrics need to be reported under a common org grouping,
// so that they are treated as an absolute value. Counter metrics need to be reported under a specific instance
// name so multiple counters get added up. (In scenarios where you are running multiple PayID servers).
const payIdLookupCounterRegistry = new Registry()
const payIdGaugeRegistry = new Registry()

/** Prometheus Counter reporting the number of PayID lookups by [network, environment, org, result]. */
const payIdLookupCounter = new Counter({
  name: 'payid_lookup_request',
  help: 'count of requests to lookup a PayID',
  labelNames: ['paymentNetwork', 'environment', 'org', 'result'],
  registers: [payIdLookupCounterRegistry],
})

/** Prometheus Gauge for reporting the current count of PayIDs by [network, environment, org]. */
const payIdGauge = new Gauge({
  name: 'payid_count',
  help: 'count of total PayIDs',
  labelNames: ['paymentNetwork', 'environment', 'org'],
  registers: [payIdGaugeRegistry],
})

/**
 * Determines whether push metrics are enabled by looking at config / environment variables.
 * Used to determine whether we should schedule pushing events for metrics.
 *
 * @returns A boolean for whether push metrics are enabled.
 *
 * @throws An error if pushing metrics is enabled, but the required configuration
 *         to push metrics is missing or malformed.
 */
function isPushMetricsEnabled(): boolean {
  if (!config.metrics.reportMetrics) {
    return false
  }

  if (!config.metrics.gatewayUrl) {
    throw new Error(
      'Pushing metrics is enabled, but the environment variable PUSH_GATEWAY_URL is not set.',
    )
  }

  try {
    // eslint-disable-next-line no-new -- We are using Node's URL library to see if the URL is valid.
    new URL(config.metrics.gatewayUrl)
  } catch {
    throw new Error(
      `Pushing metrics is enabled, but the environment variable PUSH_GATEWAY_URL is not a valid url: ${config.metrics.gatewayUrl}.`,
    )
  }

  if (!config.metrics.organization) {
    throw new Error(
      'Pushing metrics is enabled, but the environment variable PAYID_ORG is not set.',
    )
  }

  if (
    config.metrics.pushIntervalInSeconds <= 0 ||
    Number.isNaN(config.metrics.pushIntervalInSeconds)
  ) {
    throw new Error(
      `Push metrics are enabled, but the environment variable PUSH_METRICS_INTERVAL has an invalid value: ${config.metrics.pushIntervalInSeconds}.`,
    )
  }

  return true
}

/**
 * Attempt to schedule a recurring metrics push to the metrics gateway URL.
 * Configured through the environment/defaults set in the PayID
 * app config.
 *
 * @returns A timer object if push metrics are enabled, undefined otherwise.
 */
export function scheduleRecurringMetricsPush(): NodeJS.Timeout | undefined {
  if (!isPushMetricsEnabled()) {
    return undefined
  }

  const payIdLookupCounterGateway = new Pushgateway(
    config.metrics.gatewayUrl,
    [],
    payIdLookupCounterRegistry,
  )

  const payIdGaugeGateway = new Pushgateway(
    config.metrics.gatewayUrl,
    [],
    payIdGaugeRegistry,
  )

  return setInterval(() => {
    // Use 'pushAdd' because counts are additive. You want all values over time from multiple servers.
    // You don’t want the lookup count on one server to overwrite the running totals.
    payIdLookupCounterGateway.pushAdd(
      {
        jobName: 'payid_counter_metrics',
        groupings: {
          instance: `${config.metrics.organization as string}_${hostname()}_${
            process.pid
          }`,
        },
      },
      (err, _resp, _body): void => {
        if (err) {
          logger.warn('counter metrics push failed with ', err)
        }
      },
    )

    // Use push because we want the value to overwrite (only care about the current PayID count)
    payIdGaugeGateway.push(
      {
        jobName: 'payid_gauge_metrics',
        groupings: {
          instance: config.metrics.organization as string,
        },
      },
      (err, _resp, _body): void => {
        if (err) {
          logger.warn('gauge metrics push failed with ', err)
        }
      },
    )
  }, config.metrics.pushIntervalInSeconds * 1000)
}

/**
 * Record a PayID lookup that failed due to a bad accept header.
 */
export function recordPayIdLookupBadAcceptHeader(): void {
  // TODO:(hbergren) Would we ever want to record the bad accept header here?
  payIdLookupCounter.inc(
    {
      paymentNetwork: 'unknown',
      environment: 'unknown',
      org: config.metrics.organization,
      result: 'error: bad_accept_header',
    },
    1,
  )
}

/**
 * Set the PayID count for a given [paymentNetwork, environment] tuple.
 *
 * Used when calculating the total count of PayIDs for this server.
 *
 * @param paymentNetwork - The payment network of the address.
 * @param environment - The environment of the address.
 * @param count - The current count.
 */
export function setPayIdCount(
  paymentNetwork: string,
  environment: string,
  count: number,
): void {
  payIdGauge.set(
    {
      paymentNetwork,
      environment,
      org: config.metrics.organization,
    },
    count,
  )
}

/**
 * Increment a Prometheus Counter for every PayID lookup (public API).
 *
 * Segregated by whether the lookup was successful or not, and [paymentNetwork, environment].
 *
 * @param found - Whether the PayID lookup was successful or not.
 * @param paymentNetwork - The payment network of the lookup.
 * @param environment - The environment of the lookup.
 */
export function recordPayIdLookupResult(
  found: boolean,
  paymentNetwork: string,
  environment = 'null',
): void {
  payIdLookupCounter.inc(
    {
      paymentNetwork,
      environment,
      org: config.metrics.organization,
      result: found ? 'found' : 'not_found',
    },
    1,
  )
}

/**
 * Get PayID metrics from the registry.
 *
 * @returns A string representation of metrics.
 */
export function getMetrics(): string {
  return payIdLookupCounterRegistry.metrics() + payIdGaugeRegistry.metrics()
}
