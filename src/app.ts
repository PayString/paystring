import { Server } from 'http'

import * as express from 'express'

import config from './config'
import syncDatabaseSchema from './db/syncDatabaseSchema'
import sendSuccess from './middlewares/sendSuccess'
import { metricsRouter, privateAPIRouter, publicAPIRouter } from './routes'
import metrics, { checkMetricsConfiguration } from './services/metrics'
import logger from './utils/logger'

/**
 * The PayID application. Runs two Express servers on different ports.
 *
 * One server responds to PayID Protocol requests (the public API),
 * while the other server exposes CRUD commands for PayIDs stored in the database (the private API).
 */
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

  /**
   * Initializes the PayID server by:
   *  - Ensuring the database has all tables/columns necessary
   *  - Boot up the Public API server
   *  - Boot up the Private API server
   *  - Scheduling various operations around metrics.
   *
   * @param initConfig - The application configuration to initialize the app with.
   *                     Defaults to whatever is in config.ts.
   */
  public async init(initConfig = config): Promise<void> {
    // Execute DDL statements not yet defined on the current database
    await syncDatabaseSchema(initConfig.database)

    this.publicAPIServer = this.launchPublicAPI(initConfig.app)
    this.privateAPIServer = this.launchPrivateAPI(initConfig.app)

    // Check if our metrics configuration is valid.
    checkMetricsConfiguration(initConfig.metrics)

    // Explicitly log that we are pushing metrics if we're pushing metrics.
    if (initConfig.metrics.pushMetrics) {
      logger.info(
        'Pushing metrics is enabled. If you would like to opt out of pushing metrics, set the environment variable PUSH_PAYID_METRICS to "false".',
      )
    }
  }

  /**
   * Shuts down the PayID server, and cleans up the recurring metric operations.
   */
  public close(): void {
    this.publicAPIServer?.close()
    this.privateAPIServer?.close()

    metrics.stopMetricsGeneration()
  }

  /**
   * Boots up the public API to respond to PayID Protocol requests.
   *
   * @param appConfig - The application configuration to boot up the Express server with.
   *
   * @returns An HTTP server listening on the public API port.
   */
  private launchPublicAPI(appConfig: typeof config.app): Server {
    this.publicAPIExpress.use('/', publicAPIRouter)

    return this.publicAPIExpress.listen(appConfig.publicAPIPort, () =>
      logger.info(`Public API listening on ${appConfig.publicAPIPort}`),
    )
  }

  /**
   * Boots up the private API to respond to CRUD commands hitting REST endpoints.
   *
   * @param appConfig - The application configuration to boot up the Express server with.
   *
   * @returns An HTTP server listening on the private API port.
   */
  private launchPrivateAPI(appConfig: typeof config.app): Server {
    this.privateAPIExpress.use('/users', privateAPIRouter)
    this.privateAPIExpress.use('/metrics', metricsRouter)
    this.privateAPIExpress.use('/status/health', sendSuccess)

    return this.privateAPIExpress.listen(appConfig.privateAPIPort, () =>
      logger.info(`Private API listening on ${appConfig.privateAPIPort}`),
    )
  }
}
