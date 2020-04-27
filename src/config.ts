/**
 * Private API version.
 */
enum Version {
  V1 = '/v1',
}

/**
 * Application configuration.
 */
const config = {
  database: {
    connection: {
      host: process.env.DB_HOSTNAME ?? '127.0.0.1',
      user: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'password',
      database: process.env.DB_NAME ?? 'database_development',
    },
    options: {
      seedDatabase: process.env.DB_SEED === 'true',
    },
  },
  app: {
    publicAPIPort: Number(process.env.PUBLIC_API_PORT) || 8080,
    privateAPIPort: Number(process.env.PRIVATE_API_PORT) || 8081,
    version: process.env.VERSION ?? Version.V1,
    log_level: process.env.LOG_LEVEL ?? 'INFO',
    /**
     * Name of the individual or organization that operates this PayID server.
     * Organization is used to identify who is pushing the metrics in cases where
     * multiple PayID servers are pushing to a shared metrics server.
     * Required if push metrics are enabled.
     */
    organization: process.env.PAYID_ORG,
  },
  metrics: {
    /**
     * URL to prometheus push gateway. Optional. If not provided then metrics push will be disabled.
     */
    gatewayUrl: process.env.PUSH_GATEWAY_URL,
    /**
     * How frequently to push metrics to the gateway (in seconds).
     */
    pushIntervalInSeconds: Number(process.env.PUSH_METRICS_INTERVAL) || 15,
  },
}

export default config
