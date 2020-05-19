import * as knexInit from 'knex'
import * as knexStringcase from 'knex-stringcase'

import config from '../config'
import { handleDatabaseError } from '../utils/errors'

const knexConfig = {
  client: 'pg',
  connection: config.database.connection,
  pool: {
    /* eslint-disable */
  afterCreate(conn: any, done: Function): void {
    conn.query('SET timezone="UTC";', (err: Error) => {
      if (err) return done(err, conn)

      conn.query('SET statement_timeout TO 3000;', (err: Error) => {
        // if err is not falsy, connection is discarded from pool
        done(err, conn)
      })
    })
  },
  /* eslint-enable */
  },
}

// Convert between camelCase in the Node app to snake_case in the DB
const knex = knexInit(knexStringcase(knexConfig))

// Handle all database errors by listening on the callback
knex.on('query-error', (error) => {
  handleDatabaseError(error)
})

export default knex
