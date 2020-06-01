export const payIdServerVersions: readonly string[] = ['1.0']
export const privateApiVersions: readonly string[] = ['2020-05-28']

/**
 * Application configuration.
 *
 * NOTE: The defaults are developer defaults. This configuration is NOT a valid
 * production configuration. Please refer to example.production.env for
 * reference.
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
    payIdVersion: payIdServerVersions[payIdServerVersions.length - 1],
    privateApiVersion: privateApiVersions[privateApiVersions.length - 1],
    logLevel: process.env.LOG_LEVEL ?? 'INFO',
    httpsRequired: process.env.HTTPS_REQUIRED === 'true',
  },
  metrics: {
    /**
     * Name of the individual or organization that operates this PayID server.
     * Organization is used to identify who is pushing the metrics in cases where
     * multiple PayID servers are pushing to a shared metrics server.
     * Required if push metrics are enabled.
     */
    organization: process.env.PAYID_ORG,
    /**
     * URL to Prometheus push gateway. Optional. If not provided then metrics push will be disabled.
     */
    gatewayUrl: process.env.PUSH_GATEWAY_URL,
    /**
     * How frequently to push metrics to the gateway (in seconds).
     */
    pushIntervalInSeconds: Number(process.env.PUSH_METRICS_INTERVAL) || 15,
    /**
     * How frequently (in seconds) to refresh the Pay ID Count report data from the database.
     */
    payIdCountRefreshIntervalInSeconds:
      Number(process.env.PAYID_COUNT_REFRESH_INTERVAL) || 60,
  },
}

export default config
