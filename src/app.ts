import { Server } from 'http'

import config from './config'
import syncDatabaseSchema from './db/syncDatabaseSchema'
import privateAPIRouter from './routes/privateAPIRouter'
import publicAPIRouter from './routes/publicAPIRouter'
import logger from './utils/logger'

import Express = require('express')

export default class App {
  // Exposed for testing purposes
  public readonly publicAPIExpress: Express.Application
  public readonly privateAPIExpress: Express.Application

  private publicAPIServer?: Server
  private privateAPIServer?: Server

  public constructor() {
    this.publicAPIExpress = Express()
    this.privateAPIExpress = Express()
  }

  public async init(initConfig = config): Promise<void> {
    // Execute DDL statements not yet defined on the current database
    await syncDatabaseSchema(initConfig.database)

    this.publicAPIServer = this.launchPublicAPI(initConfig.app)
    this.privateAPIServer = this.launchPrivateAPI(initConfig.app)
  }

  private launchPublicAPI(appConfig = config.app): Server {
    this.publicAPIExpress.use('/', publicAPIRouter)

    return this.publicAPIExpress.listen(appConfig.publicAPIPort, () =>
      logger.info(`Public API listening on ${appConfig.publicAPIPort}`),
    )
  }

  private launchPrivateAPI(appConfig = config.app): Server {
    this.privateAPIExpress.use(`${appConfig.version}/users`, privateAPIRouter)

    return this.privateAPIExpress.listen(appConfig.privateAPIPort, () =>
      logger.info(`Private API listening on ${appConfig.privateAPIPort}`),
    )
  }

  public close(): void {
    this.publicAPIServer?.close()
    this.privateAPIServer?.close()
  }
}
