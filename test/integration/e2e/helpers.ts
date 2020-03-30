import * as v8 from 'v8'

import App from '../../../src/app'
import config from '../../../src/config'
import knex from '../../../src/db/knex'

/**
 * Deep clones an object *properly*.
 *
 * @param obj The object to be deep cloned.
 */
export default function structuredClone<T>(obj: T): T {
  return v8.deserialize(v8.serialize(obj))
}

/**
 * Initialize database connection pool & boot up the Express application.
 *
 * @returns The Express app.
 */
export async function appSetup(): Promise<App> {
  const app = new App()

  // Deep cloning the configuration so we don't mutate the global shared configuration
  const testConfig = structuredClone(config)
  testConfig.database.options.logQueries = false
  testConfig.database.options.seedDatabase = true

  await app.init(testConfig)
  knex.initialize()

  return app
}

/**
 * Shut down Express application & close database connections.
 *
 * @param app The Express app.
 */
export async function appCleanup(app?: App): Promise<void> {
  if (app) app.close()
  await knex.destroy()
}
