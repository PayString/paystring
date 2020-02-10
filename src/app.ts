import Config from './services/config'

import Express = require('express')
import Reduct = require('reduct')

export default class App {
  private publicApiServer: Express.Application

  private privateApiServer: Express.Application

  private config: Config

  constructor(deps: Reduct.Injector) {
    this.config = deps(Config)
  }

  public async init(): Promise<void> {
    this.publicApiServer = Express()
    this.privateApiServer = Express()

    this.publicApiServer.get('/', (req, res) => {
      res.send('This server should receive requests from $domain.com/user')
    })
    this.privateApiServer.get('/', (req, res) => {
      res.send(
        'This will expose a simple CRUD API for wallets to update user mappings.',
      )
    })

    const publicApi = this.publicApiServer.listen(
      this.config.publicApiPort,
      () => {
        console.log(`Public API listening on ${this.config.publicApiPort}`)
      },
    )
    const privateApi = this.privateApiServer.listen(
      this.config.privateApiPort,
      () => {
        console.log(`Private API listening on ${this.config.privateApiPort}`)
      },
    )

    await Promise.all([publicApi, privateApi])
  }
}
