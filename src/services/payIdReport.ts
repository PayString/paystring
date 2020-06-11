import config from '../config'
import getPayIdCounts from '../data-access/reports'
import logger from '../utils/logger'

import { setPayIdCount } from './metrics'

/** Generates the number of PayIDs grouped by [paymentNetwork, environment]. */
export async function generatePayIdCountMetrics(): Promise<void> {
  const payIdCounts = await getPayIdCounts()

  payIdCounts.forEach((payIdCount) => {
    setPayIdCount(
      payIdCount.paymentNetwork,
      payIdCount.environment,
      payIdCount.count,
    )
  })
}

/**
 * Set a recurring timer that will generate PayID count metrics every PAYID_COUNT_REFRESH_INTERVAL seconds.
 *
 * @returns A timer that will generate PayID count metrics every X seconds.
 */
export default function scheduleRecurringPayIdCountMetrics():
  | NodeJS.Timeout
  | undefined {
  const refreshIntervalInSeconds =
    config.metrics.payIdCountRefreshIntervalInSeconds

  if (refreshIntervalInSeconds <= 0 || Number.isNaN(refreshIntervalInSeconds)) {
    logger.warn(
      `Invalid PAYID_COUNT_REFRESH_INTERVAL value: ${refreshIntervalInSeconds}. PayID count metrics will not be scheduled.`,
    )
    return undefined
  }

  // Generate the metrics immediately so we don't wait for the interval
  generatePayIdCountMetrics().catch((err) =>
    logger.warn('Failed to generate initial PayID count metrics', err),
  )

  return setInterval(() => {
    generatePayIdCountMetrics().catch((err) =>
      logger.warn('Failed to generate scheduled PayID count metrics', err),
    )
  }, refreshIntervalInSeconds * 1000)
}
