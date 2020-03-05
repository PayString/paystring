import syncDatabaseSchema from './db/syncDatabaseSchema'
import privateAPIRouter from './routes/privateAPIRouter'
import publicAPIRouter from './routes/publicAPIRouter'
import { Config, Version } from './services/config'

import Express = require('express')

export default class App {
  private publicAPIServer: Express.Application

  private privateAPIServer: Express.Application

  public async init(): Promise<void> {
    // Execute DDL statements not yet defined on the current database
    await syncDatabaseSchema()

    this.launchPublicAPI()
    this.launchPrivateAPI()
  }

  private launchPublicAPI(): void {
    this.publicAPIServer = Express()
    this.publicAPIServer.get('/*', publicAPIRouter)
    this.publicAPIServer.listen(Config.publicAPIPort, () =>
      console.log(`Public API listening on ${Config.publicAPIPort}`),
    )
  }

  private launchPrivateAPI(): void {
    this.privateAPIServer = Express()
    this.privateAPIServer.use(`${Version.V1}/users`, privateAPIRouter)
    this.privateAPIServer.listen(Config.privateAPIPort, () =>
      console.log(`Private API listening on ${Config.privateAPIPort}`),
    )
  }
}
