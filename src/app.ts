import { Server } from 'http'

import syncDatabaseSchema from './db/syncDatabaseSchema'
import privateAPIRouter from './routes/privateAPIRouter'
import publicAPIRouter from './routes/publicAPIRouter'
import { Config, Version } from './services/config'

import Express = require('express')

export default class App {
  // Exposed for testing purposes
  public publicAPIExpress: Express.Application
  public privateAPIExpress: Express.Application

  private publicAPIServer: Server
  private privateAPIServer: Server

  public async init(): Promise<void> {
    // Execute DDL statements not yet defined on the current database
    await syncDatabaseSchema()

    this.launchPublicAPI()
    this.launchPrivateAPI()
  }

  private launchPublicAPI(): void {
    this.publicAPIExpress = Express()
    this.publicAPIExpress.get('/*', publicAPIRouter)

    this.publicAPIServer = this.publicAPIExpress.listen(
      Config.publicAPIPort,
      () => console.log(`Public API listening on ${Config.publicAPIPort}`),
    )
  }

  private launchPrivateAPI(): void {
    this.privateAPIExpress = Express()
    this.privateAPIExpress.use(`${Version.V1}/users`, privateAPIRouter)
    this.privateAPIServer = this.privateAPIExpress.listen(
      Config.privateAPIPort,
      () => console.log(`Private API listening on ${Config.privateAPIPort}`),
    )
  }

  public close(): void {
    this.publicAPIServer.close()
    this.privateAPIServer.close()
  }
}
