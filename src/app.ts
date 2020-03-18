import { Server } from 'http'

import syncDatabaseSchema from './db/syncDatabaseSchema'
import privateAPIRouter from './routes/privateAPIRouter'
import publicAPIRouter from './routes/publicAPIRouter'
import { Config, Version } from './services/config'

import Express = require('express')

interface InitializationOptions {
  log: boolean
  seedDatabase: boolean
}

export default class App {
  // Exposed for testing purposes
  public publicAPIExpress: Express.Application
  public privateAPIExpress: Express.Application

  private publicAPIServer: Server
  private privateAPIServer: Server

  private initOptions: InitializationOptions

  // TODO: Change the default value of seedDatabase to false
  public async init(
    options: InitializationOptions = { log: true, seedDatabase: true },
  ): Promise<void> {
    this.initOptions = options
    // Execute DDL statements not yet defined on the current database
    await syncDatabaseSchema({
      logQueries: options.log,
      seedDatabase: options.seedDatabase,
    })

    this.launchPublicAPI()
    this.launchPrivateAPI()
  }

  private launchPublicAPI(): void {
    this.publicAPIExpress = Express()
    this.publicAPIExpress.use('/', publicAPIRouter)

    this.publicAPIServer = this.publicAPIExpress.listen(
      Config.publicAPIPort,
      () =>
        this.initOptions.log &&
        console.log(`Public API listening on ${Config.publicAPIPort}`),
    )
  }

  private launchPrivateAPI(): void {
    this.privateAPIExpress = Express()
    this.privateAPIExpress.use(`${Version.V1}/users`, privateAPIRouter)
    this.privateAPIServer = this.privateAPIExpress.listen(
      Config.privateAPIPort,
      () =>
        this.initOptions.log &&
        console.log(`Private API listening on ${Config.privateAPIPort}`),
    )
  }

  public close(): void {
    this.publicAPIServer.close()
    this.privateAPIServer.close()
  }
}
