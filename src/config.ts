export const payIdServerVersions: readonly string[] = ['1.0']
export const adminApiVersions: readonly string[] = ['2020-05-28']

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
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'password',
      database: process.env.DB_NAME ?? 'database_development',
    },
    options: {
      seedDatabase: process.env.DB_SEED === 'true',
    },
  },
  app: {
    publicApiPort: Number(process.env.PUBLIC_API_PORT) || 8080,
    // TODO: (When we make a breaking Admin API change, cut PRIVATE_API_PORT)
    adminApiPort:
      Number(process.env.PRIVATE_API_PORT ?? process.env.ADMIN_API_PORT) ||
      8081,
    payIdVersion: payIdServerVersions[payIdServerVersions.length - 1],
    adminApiVersion: adminApiVersions[adminApiVersions.length - 1],
    logLevel: process.env.LOG_LEVEL ?? 'INFO',
  },
  metrics: {
    /**
     * Whether or not to report PayID server metrics. Defaults to true.
     * To opt out,  you can set the PUSH_PAYID_METRICS to any value that isn't "true".
     */
    pushMetrics: process.env.PUSH_PAYID_METRICS
      ? process.env.PUSH_PAYID_METRICS === 'true'
      : true,
    /**
     * Domain name that operates this PayID server.
     *
     * Used to identify who is pushing the metrics in cases where multiple PayID servers are pushing to a shared metrics server.
     * Required for pushing metrics.
     *
     * This will be dynamically set by incoming requests if the ENV var is unset.
     */
    domain: process.env.PAYID_DOMAIN,

    /** URL to a Prometheus push gateway, defaulting to the Xpring Prometheus server. */
    gatewayUrl:
      process.env.PUSH_GATEWAY_URL ?? 'https://push00.mon.payid.tech/',

    /** How frequently (in seconds) to push metrics to the Prometheus push gateway. */
    pushIntervalInSeconds: Number(process.env.PUSH_METRICS_INTERVAL) || 15,

    /** How frequently (in seconds) to refresh the PayID Count report data from the database. */
    payIdCountRefreshIntervalInSeconds:
      Number(process.env.PAYID_COUNT_REFRESH_INTERVAL) || 60,
  },
}

export default config
