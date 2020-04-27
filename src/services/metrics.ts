import { hostname } from 'os'

import { Counter, Pushgateway, Registry } from 'prom-client'

import config from '../config'
import logger from '../utils/logger'

const payIdCounterRegistry = new Registry()

const requestCounter = new Counter({
  name: 'payid_lookup_request',
  help: 'count of requests to lookup a PayID',
  labelNames: ['paymentNetwork', 'environment', 'org', 'result'],
  registers: [payIdCounterRegistry],
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

export function scheduleRecurringMetricsPush(): void {
  if (!config.metrics.gatewayUrl) {
    // this shouldn't be possible if isPushMetricsEnabled() is being checked first but just in case
    logger.debug(`gatewayUrl not set. Metrics will not be pushed.`)
    return
  }
  const counterGateway = new Pushgateway(
    config.metrics.gatewayUrl,
    [],
    payIdCounterRegistry,
  )
  setInterval(() => {
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
  }, config.metrics.pushIntervalInSeconds * 1000)
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
  return payIdCounterRegistry.metrics()
}
