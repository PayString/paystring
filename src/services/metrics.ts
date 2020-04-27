import { hostname } from 'os'

import { Counter, Gauge, Pushgateway, Registry } from 'prom-client'

import config from '../config'
import logger from '../utils/logger'

const payIdCounterRegistry = new Registry()
const payIdGaugeRegistry = new Registry()

const requestCounter = new Counter({
  name: 'payid_lookup_request',
  help: 'count of requests to lookup a PayID',
  labelNames: ['paymentNetwork', 'environment', 'org', 'result'],
  registers: [payIdCounterRegistry],
})

/**
 * Gauge for reporting the current count of PayIDs by network/environment/org
 */
const payIdCountGauge = new Gauge({
  name: 'payid_count',
  help: 'count of total PayIDs',
  labelNames: ['paymentNetwork', 'environment', 'org'],
  registers: [payIdGaugeRegistry],
})

export const isPushMetricsEnabled = (): boolean => {
  if (config.metrics.gatewayUrl) {
    if (!config.app.organization) {
      logger.warn(`PAYID_ORG must be set if push enabled. 
    Metrics will not be pushed.`)
      return false
    }
    return true
  }
  return false
}

export function scheduleRecurringMetricsPush(): NodeJS.Timeout | undefined {
  if (!config.metrics.gatewayUrl) {
    // this shouldn't be possible if isPushMetricsEnabled() is being checked first but just in case
    logger.debug(`gatewayUrl not set. Metrics will not be pushed.`)
    return undefined
  }
  if (config.metrics.pushIntervalInSeconds <= 0) {
    // this shouldn't be possible if isPushMetricsEnabled() is being checked first but just in case
    logger.warn(
      `invalid pushIntervalInSeconds value ${config.metrics.pushIntervalInSeconds}. Metrics will not be pushed.`,
    )
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
          instance: `${config.app.organization}_${hostname()}_${process.pid}`,
        },
      },
      (err, _resp, _body): void => {
        if (err) {
          logger.warn(`metrics push failed with error ${err} `)
        }
      },
    )
    gaugeGateway.push(
      {
        jobName: 'payid_gauge_metrics',
        groupings: { instance: config.app.organization as string },
      },
      (err, _resp, _body): void => {
        if (err) {
          logger.warn(`gauge metrics push failed with error ${err} `)
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
      org: config.app.organization,
      result: `error: bad_accept_header`,
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
      org: config.app.organization,
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
      org: config.app.organization,
      result: found ? 'found' : 'not_found',
    },
    1,
  )
}

export function getMetrics(): string {
  return payIdCounterRegistry.metrics() + payIdGaugeRegistry.metrics()
}
