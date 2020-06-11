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

export function scheduleRecurringMetricsPush(): NodeJS.Timeout | undefined {
  if (!isPushMetricsEnabled()) {
    return undefined
  }

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

export function recordPayIdLookupBadAcceptHeader(): void {
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

export function recordPayIdLookupResult(
  paymentNetwork: string,
  environment: string,
  found: boolean,
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

export function getMetrics(): string {
  return payIdRegistry.metrics()
}
