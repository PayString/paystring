import * as knexInit from 'knex'

import databaseConfiguration from './databaseConfiguration'

const knex = knexInit({
  client: 'pg',
  connection: databaseConfiguration,
})

export default knex
