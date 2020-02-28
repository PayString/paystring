export enum Version {
  V1 = '/v1',
}

export class Config {
  /**
   * @param publicAPIPort port responding to PayID requests
   * @param privateAPIPort port responding to API updating users' PayIDs
   */
  static readonly publicAPIPort = 8080

  static readonly privateAPIPort = 8081
}
