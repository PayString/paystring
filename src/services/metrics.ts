import { Metrics } from '@payid-org/payid-metrics'

import configuration from '../config'
import { getAddressCounts, getPayIdCount } from '../data-access/reports'
import logger from '../utils/logger'

const metrics = new Metrics(
  getAddressCounts,
  getPayIdCount,
  configuration.metrics,
  logger,
)

export default metrics
