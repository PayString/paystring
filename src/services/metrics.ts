import { hostname } from 'os'

import { Counter, Gauge, Pushgateway, Registry } from 'prom-client'

import config from '../config'
import logger from '../utils/logger'

/**
 * Custom Prometheus registry.
 * The default registry gets used for other metrics that we don't want to collect from partners, like memory usage.
 */
const payIdRegistry = new Registry()

/** Prometheus Counter reporting the number of PayID lookups by [network, environment, org, result]. */
const payIdLookupCounter = new Counter({
  name: 'payid_lookup_request',
  help: 'count of requests to lookup a PayID',
  labelNames: ['paymentNetwork', 'environment', 'org', 'result'],
  registers: [payIdRegistry],
})

/** Prometheus Gauge for reporting the current count of PayIDs by [network, environment, org]. */
const payIdCountGauge = new Gauge({
  name: 'payid_count',
  help: 'count of total PayIDs',
  labelNames: ['paymentNetwork', 'environment', 'org'],
  registers: [payIdRegistry],
})

/**
 * Determines whether push metrics are enabled by looking at config / environment variables.
 * Used to determine whether we should schedule pushing events for metrics.
 *
 * @returns A boolean for whether push metrics are enabled.
 */
function isPushMetricsEnabled(): boolean {
  // TODO:(hbergren) Maybe check that this is actually a valid url as well using Node.URL
  if (!config.metrics.gatewayUrl) {
    logger.warn(
      'PUSH_GATEWAY_URL must be set for metrics to be pushed. Metrics will not be pushed.',
    )
    return false
  }

  if (!config.metrics.organization) {
    logger.warn(
      'PAYID_ORG must be set for metrics to be pushed. Metrics will not be pushed.',
    )
    return false
  }

  if (
    config.metrics.pushIntervalInSeconds <= 0 ||
    Number.isNaN(config.metrics.pushIntervalInSeconds)
  ) {
    logger.warn(
      `Invalid PUSH_METRICS_INTERVAL value: ${config.metrics.pushIntervalInSeconds}. Metrics will not be pushed.`,
    )
    return false
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

  /** Prometheus Push Gateway for pushing PayID metrics. */
  const payIdPushGateway = new Pushgateway(
    config.metrics.gatewayUrl,
    [],
    payIdRegistry,
  )

  return setInterval(() => {
    // Use 'pushAdd' because counts are additive. You want all values over time from multiple servers.
    // You don’t want the lookup count on one server to overwrite the running totals.
    payIdPushGateway.pushAdd(
      {
        jobName: 'payid_lookup_counter_metrics',
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
    payIdPushGateway.push(
      {
        jobName: 'payid_count_gauge_metrics',
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
  payIdCountGauge.set(
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
  return payIdRegistry.metrics()
}
