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
 * @param metricsConfig - A configuration object that controls how often metrics will be generated.
 *
 * @returns A timer that will generate PayID count metrics every X seconds.
 *
 * @throws An error if PAYID_COUNT_REFRESH_INTERVAL is invalid (negative number, or interval greater than 24 hours).
 */
export default function scheduleRecurringPayIdCountMetrics(
  metricsConfig = config.metrics,
): NodeJS.Timeout | undefined {
  const refreshIntervalInSeconds =
    metricsConfig.payIdCountRefreshIntervalInSeconds

  const oneDayInSeconds = 86400
  if (
    refreshIntervalInSeconds <= 0 ||
    refreshIntervalInSeconds >= oneDayInSeconds
  ) {
    throw new Error(
      `Invalid PAYID_COUNT_REFRESH_INTERVAL value: "${refreshIntervalInSeconds}". Must be a positive number less than 86400 seconds. PayID count metrics will not be generated.`,
    )
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
