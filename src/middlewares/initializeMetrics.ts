import { Request, Response, NextFunction } from 'express'

import config from '../config'
import metrics from '../services/metrics'

/**
 * An Express middleware that schedules metrics generation.
 *
 * It also looks at the request hostname property to dynamically set
 * the domain to associate the metrics it pushes with (if push metrics are enabled).
 *
 * @param req - An Express request object. We get the hostname off of this for pushing metrics.
 * @param _res - An Express response object (unused).
 * @param next - An Express next function.
 */
export default function initializeMetrics(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  // Start metrics on the first public API request.
  // This will _always_ happen at initialization unless the PAYID_DOMAIN env var is set.
  if (!config.metrics.domain || !metrics.areMetricsRunning()) {
    config.metrics.domain = req.hostname

    metrics.scheduleRecurringMetricsPush()
    metrics.scheduleRecurringPayIdCountMetrics()
  }

  next()
}
