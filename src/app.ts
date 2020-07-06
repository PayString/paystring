import { Server } from 'http'

import * as express from 'express'

import config from './config'
import syncDatabaseSchema from './db/syncDatabaseSchema'
import sendSuccess from './middlewares/sendSuccess'
import { metricsRouter, adminApiRouter, publicApiRouter } from './routes'
import metrics, { checkMetricsConfiguration } from './services/metrics'
import logger from './utils/logger'

/**
 * The PayID application. Runs two Express servers on different ports.
 *
 * One server responds to PayID Protocol requests (the public API),
 * while the other server exposes CRUD commands for PayIDs stored in the database (the Admin API).
 */
export default class App {
  // Exposed for testing purposes
  public readonly publicApiExpress: express.Application
  public readonly adminApiExpress: express.Application

  private publicApiServer?: Server
  private adminApiServer?: Server

  public constructor() {
    this.publicApiExpress = express()
    this.adminApiExpress = express()
  }

  /**
   * Initializes the PayID server by:
   *  - Ensuring the database has all tables/columns necessary
   *  - Boot up the Public API server
   *  - Boot up the Admin API server
   *  - Scheduling various operations around metrics.
   *
   * @param initConfig - The application configuration to initialize the app with.
   *                     Defaults to whatever is in config.ts.
   */
  public async init(initConfig = config): Promise<void> {
    // Execute DDL statements not yet defined on the current database
    await syncDatabaseSchema(initConfig.database)

    this.publicApiServer = this.launchPublicApi(initConfig.app)
    this.adminApiServer = this.launchAdminApi(initConfig.app)

    // Check if our metrics configuration is valid.
    checkMetricsConfiguration(initConfig.metrics)

    // Explicitly log that we are pushing metrics if we're pushing metrics.
    if (initConfig.metrics.pushMetrics) {
      logger.info(`Pushing metrics is enabled.

      Metrics only capture the total number of PayIDs grouped by (paymentNetwork, environment),
      and the (paymentNetwork, environment) tuple of public requests to the PayID server.
      No identifying information is captured.

      If you would like to opt out of pushing metrics, set the environment variable PUSH_PAYID_METRICS to "false".
    `)
    }
  }

  /**
   * Shuts down the PayID server, and cleans up the recurring metric operations.
   */
  public close(): void {
    this.publicApiServer?.close()
    this.adminApiServer?.close()

    metrics.stopMetricsGeneration()
  }

  /**
   * Boots up the public API to respond to PayID Protocol requests.
   *
   * @param appConfig - The application configuration to boot up the Express server with.
   *
   * @returns An HTTP server listening on the public API port.
   */
  private launchPublicApi(appConfig: typeof config.app): Server {
    this.publicApiExpress.use('/', publicApiRouter)

    return this.publicApiExpress.listen(appConfig.publicApiPort, () =>
      logger.info(`Public API listening on ${appConfig.publicApiPort}`),
    )
  }

  /**
   * Boots up the Admin API to respond to CRUD commands hitting REST endpoints.
   *
   * @param appConfig - The application configuration to boot up the Express server with.
   *
   * @returns An HTTP server listening on the Admin API port.
   */
  private launchAdminApi(appConfig: typeof config.app): Server {
    this.adminApiExpress.use('/users', adminApiRouter)
    this.adminApiExpress.use('/metrics', metricsRouter)
    this.adminApiExpress.use('/status/health', sendSuccess)

    return this.adminApiExpress.listen(appConfig.adminApiPort, () =>
      logger.info(`Admin API listening on ${appConfig.adminApiPort}`),
    )
  }
}
