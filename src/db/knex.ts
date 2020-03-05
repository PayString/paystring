import * as knexInit from 'knex'

const knex = knexInit({
  client: 'pg',
  connection: {
    host: process.env.DB_HOSTNAME || '127.0.0.1',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'database_development',
  },
})

export default knex
