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
      host: process.env.DB_HOSTNAME || '127.0.0.1',
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'database_development',
    },
    options: {
      seedDatabase: process.env.DB_SEED === 'true' || false,
    },
  },
  app: {
    publicAPIPort: Number(process.env.PUBLIC_API_PORT) || 8080,
    privateAPIPort: Number(process.env.PRIVATE_API_PORT) || 8081,
    version: process.env.VERSION || Version.V1,
    log_level: process.env.LOG_LEVEL || 'INFO',
  },
}

export default config
