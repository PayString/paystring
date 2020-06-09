import { hostname } from 'os'

import { Counter, Gauge, Pushgateway, Registry } from 'prom-client'

import config from '../config'
import logger from '../utils/logger'

const payIdCounterRegistry = new Registry()
const payIdGaugeRegistry = new Registry()

/** Prometheus Counter reporting the number of PayID lookups by [network, environment, org, result]. */
const requestCounter = new Counter({
  name: 'payid_lookup_request',
  help: 'count of requests to lookup a PayID',
  labelNames: ['paymentNetwork', 'environment', 'org', 'result'],
  registers: [payIdCounterRegistry],
})

/** Prometheus Gauge for reporting the current count of PayIDs by [network, environment, org]. */
const payIdCountGauge = new Gauge({
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

  const counterGateway = new Pushgateway(
    config.metrics.gatewayUrl,
    [],
    payIdCounterRegistry,
  )

  const gaugeGateway = new Pushgateway(
    config.metrics.gatewayUrl,
    [],
    payIdGaugeRegistry,
  )

  return setInterval(() => {
    counterGateway.pushAdd(
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
    gaugeGateway.push(
      {
        jobName: 'payid_gauge_metrics',
        groupings: { instance: config.metrics.organization as string },
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
 * Resets PayID count gauge. This should normally be called just before
 * refreshing PayID count metrics from the database.
 */
export function resetPayIdCounts(): void {
  payIdGaugeRegistry.resetMetrics()
}

export function recordPayIdLookupBadAcceptHeader(): void {
  requestCounter.inc(
    {
      paymentNetwork: 'unknown',
      environment: 'unknown',
      org: config.metrics.organization,
      result: 'error: bad_accept_header',
    },
    1,
  )
}

export function recordPayIdCount(
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
  requestCounter.inc(
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
  return payIdCounterRegistry.metrics() + payIdGaugeRegistry.metrics()
}
