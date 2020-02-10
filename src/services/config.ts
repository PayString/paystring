export default class Config {
  public privateApiPort: number

  public publicApiPort: number

  constructor() {
    this.publicApiPort = 8080
    this.privateApiPort = 8081
  }
}
