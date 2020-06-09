import config from '../config'
import getPayIdCounts from '../data-access/reports'
import logger from '../utils/logger'

import { recordPayIdCount, resetPayIdCounts } from './metrics'

export async function generatePayIdCountMetrics(): Promise<void> {
  const payIdCounts = await getPayIdCounts()

  resetPayIdCounts()

  payIdCounts.forEach((payIdCount) => {
    recordPayIdCount(
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

  setTimeout(() => {
    generatePayIdCountMetrics().catch((err) =>
      logger.warn('Failed to generate initial PayID count metrics', err),
    )
  }, 1)
  return setInterval(() => {
    generatePayIdCountMetrics().catch((err) =>
      logger.warn('Failed to generate scheduled PayID count metrics', err),
    )
  }, refreshIntervalInSeconds * 1000)
}
