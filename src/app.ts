import { Server } from 'http'

import config from './config'
import syncDatabaseSchema from './db/syncDatabaseSchema'
import privateAPIRouter from './routes/privateAPIRouter'
import publicAPIRouter from './routes/publicAPIRouter'
import logger from './utils/logger'

import Express = require('express')

export default class App {
  // Exposed for testing purposes
  public publicAPIExpress: Express.Application
  public privateAPIExpress: Express.Application

  private publicAPIServer: Server
  private privateAPIServer: Server

  public async init(initConfig = config): Promise<void> {
    // Execute DDL statements not yet defined on the current database
    await syncDatabaseSchema(initConfig.database)

    this.launchPublicAPI(initConfig.app)
    this.launchPrivateAPI(initConfig.app)
  }

  private launchPublicAPI(appConfig = config.app): void {
    this.publicAPIExpress = Express()
    this.publicAPIExpress.use('/', publicAPIRouter)

    this.publicAPIServer = this.publicAPIExpress.listen(
      appConfig.publicAPIPort,
      () => logger.info(`Public API listening on ${appConfig.publicAPIPort}`),
    )
  }

  private launchPrivateAPI(appConfig = config.app): void {
    this.privateAPIExpress = Express()
    this.privateAPIExpress.use(`${appConfig.version}/users`, privateAPIRouter)
    this.privateAPIServer = this.privateAPIExpress.listen(
      appConfig.privateAPIPort,
      () => logger.info(`Private API listening on ${appConfig.privateAPIPort}`),
    )
  }

  public close(): void {
    this.publicAPIServer.close()
    this.privateAPIServer.close()
  }
}
