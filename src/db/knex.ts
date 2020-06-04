import * as knexInit from 'knex'
import * as knexStringcase from 'knex-stringcase'

import config from '../config'
import { handleDatabaseError } from '../utils/errors'

const knexConfig = {
  client: 'pg',
  connection: config.database.connection,
  pool: {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types --
     * Knex doesn't have great types for the afterCreate parameters
     */
    /**
     * A function automatically called by Knex after we initialize our database connection pool.
     * Ensures the database timezone is set to UTC and queries only timeout after 3 seconds.
     *
     * @param conn - A Knex database connection.
     * @param done - A callback to handle the asynchronous nature of database queries.
     */
    afterCreate(conn: any, done: Function): void {
      conn.query('SET timezone="UTC";', async (err?: Error) => {
        if (err) {
          return done(err, conn)
        }

        conn.query('SET statement_timeout TO 3000;', async (error: Error) => {
          // if err is not falsy, connection is discarded from pool
          done(error, conn)
        })

        return undefined
      })
    },
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */
  },
}

// Convert between camelCase in the Node app to snake_case in the DB
const knex = knexInit(knexStringcase(knexConfig))

// Handle all database errors by listening on the callback
knex.on('query-error', (error) => {
  handleDatabaseError(error)
})

export default knex
