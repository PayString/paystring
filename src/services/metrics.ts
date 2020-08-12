import { Metrics } from '@payid-org/server-metrics'

import configuration from '../config'
import { getAddressCounts, getPayIdCount } from '../data-access/reports'

const metrics = new Metrics(
  configuration.metrics,
  getAddressCounts,
  getPayIdCount,
)

export default metrics
