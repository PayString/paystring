import { getPayIdCounts } from '../data-access/reports'
import { PayIdCount } from '../types/reports'
import logger from '../utils/logger'

import { recordPayIdCount, resetPayIdCounts } from './metrics'

export function generatePayIdCountMetrics(): Promise<void | PayIdCount[]> {
  return getPayIdCounts().then((results) => {
    resetPayIdCounts()
    results.forEach((result) =>
      recordPayIdCount(
        result.payment_network,
        result.environment,
        result.count,
      ),
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
