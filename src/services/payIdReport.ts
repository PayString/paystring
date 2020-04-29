import getPayIdCounts from '../data-access/reports'
import logger from '../utils/logger'

import { recordPayIdCount, resetPayIdCounts } from './metrics'

export async function generatePayIdCountMetrics(): Promise<void> {
  const payIdCounts = await getPayIdCounts()

  resetPayIdCounts()

  payIdCounts.forEach((payIdCount) => {
    recordPayIdCount(
      payIdCount.payment_network,
      payIdCount.environment,
      payIdCount.count,
    )
  })
}

export default function scheduleRecurringPayIdCountMetrics(
  refreshIntervalInSeconds: number,
): NodeJS.Timeout | undefined {
  if (refreshIntervalInSeconds <= 0) {
    logger.warn(
      `invalid refreshIntervalInSeconds value ${refreshIntervalInSeconds}. skipping scheduling.`,
    )
    return undefined
  }
  setTimeout(() => {
    generatePayIdCountMetrics().catch((err) =>
      logger.warn('failed to generate initial payid count metrics', err),
    )
  }, 1)
  return setInterval(() => {
    generatePayIdCountMetrics().catch((err) =>
      logger.warn('failed to generate scheduled payid count metrics', err),
    )
  }, refreshIntervalInSeconds * 1000)
}
