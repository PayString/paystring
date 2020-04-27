import { Server } from 'http'

import * as express from 'express'

import config from './config'
import syncDatabaseSchema from './db/syncDatabaseSchema'
import metricsRouter from './routes/metricsRouter'
import privateAPIRouter from './routes/privateAPIRouter'
import publicAPIRouter from './routes/publicAPIRouter'
import {
  isPushMetricsEnabled,
  scheduleRecurringMetricsPush,
} from './services/metrics'
import logger from './utils/logger'

export default class App {
  // Exposed for testing purposes
  public readonly publicAPIExpress: express.Application
  public readonly privateAPIExpress: express.Application

  private publicAPIServer?: Server
  private privateAPIServer?: Server

  public constructor() {
    this.publicAPIExpress = express()
    this.privateAPIExpress = express()
  }

  public async init(initConfig = config): Promise<void> {
    // Execute DDL statements not yet defined on the current database
    await syncDatabaseSchema(initConfig.database)

    this.publicAPIServer = this.launchPublicAPI(initConfig.app)
    this.privateAPIServer = this.launchPrivateAPI(initConfig.app)
    if (isPushMetricsEnabled()) {
      scheduleRecurringMetricsPush()
    }
  }

  public close(): void {
    this.publicAPIServer?.close()
    this.privateAPIServer?.close()
  }

  private launchPublicAPI(appConfig = config.app): Server {
    this.publicAPIExpress.use('/', publicAPIRouter)

    return this.publicAPIExpress.listen(appConfig.publicAPIPort, () =>
      logger.info(`Public API listening on ${appConfig.publicAPIPort}`),
    )
  }

  private launchPrivateAPI(appConfig = config.app): Server {
    this.privateAPIExpress.use(`${appConfig.version}/users`, privateAPIRouter)
    this.privateAPIExpress.use('/metrics', metricsRouter)

    return this.privateAPIExpress.listen(appConfig.privateAPIPort, () =>
      logger.info(`Private API listening on ${appConfig.privateAPIPort}`),
    )
  }
}
