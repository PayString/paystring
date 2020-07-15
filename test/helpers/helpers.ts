import * as v8 from 'v8'

import App from '../../src/app'
import config from '../../src/config'
import knex from '../../src/db/knex'
import syncDatabaseSchema from '../../src/db/syncDatabaseSchema'

/**
 * Deep clones an object *properly*.
 *
 * @param obj - The object to be deep cloned.
 *
 * @returns A deeply cloned object.
 */
export function structuredClone<T>(obj: T): T {
  return v8.deserialize(v8.serialize(obj))
}

/**
 * Boots up the Express application for testing purposes.
 * The first time this is run it will initialize the database connection pool.
 *
 * @returns The Express application.
 */
export async function appSetup(): Promise<App> {
  const app = new App()

  // Deep cloning the configuration so we don't mutate the global shared configuration
  const testConfig = structuredClone(config)
  testConfig.database.options.seedDatabase = true

  await app.init(testConfig)

  return app
}

/**
 * Shuts down the Express application, so there are not running processes when testing ends.
 *
 * @param app - The Express app.
 */
export function appCleanup(app: App): void {
  app.close()
}

export async function seedDatabase(): Promise<void> {
  // Deep cloning the configuration so we don't mutate the global shared configuration
  const testConfig = structuredClone(config)
  testConfig.database.options.seedDatabase = true

  await syncDatabaseSchema(testConfig.database)
}

/**
 * Gets the definition of a database constraint.
 *
 * @param constraintName - The name of the constraint.
 * @param tableName - The name of the table associated with the constraint.
 *
 * @returns The constraint definition from the database.
 */
export async function getDatabaseConstraintDefinition(
  constraintName: string,
  tableName: string,
): Promise<string> {
  return knex
    .raw(
      `
        -- Select the constraint definition in the relevant table.
        -- We fetch the relevant constraint, get the constraint definition.
        --
        SELECT  pg_get_constraintdef(con.oid) as constraint_def
        FROM    pg_constraint con
                INNER JOIN pg_class rel ON rel.oid = con.conrelid
        WHERE   con.conname = ?
                AND rel.relname = ?;
      `,
      [constraintName, tableName],
    )
    .then(async (result) => result.rows[0].constraint_def)
}
