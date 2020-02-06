import Express = require('express')

export default class App {
  private publicApiServer: Express.Application

  private privateApiServer: Express.Application

  private publicApiServerPort: number

  private privateApiServerPort: number

  constructor() {
    this.publicApiServerPort = 8080
    this.privateApiServerPort = 8081
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
      this.publicApiServerPort,
      () => {
        console.log(`Public API listening on ${this.publicApiServerPort}`)
      },
    )
    const privateApi = this.privateApiServer.listen(
      this.privateApiServerPort,
      () => {
        console.log(`Private API listening on ${this.privateApiServerPort}`)
      },
    )

    await Promise.all([publicApi, privateApi])
  }
}
