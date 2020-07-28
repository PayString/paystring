import * as path from 'path'

import * as express from 'express'

import checkPublicApiVersionHeaders from '../middlewares/checkPublicApiVersionHeaders'
import constructJrd from '../middlewares/constructJrd'
import errorHandler, { wrapAsync } from '../middlewares/errorHandler'
import initializeMetrics from '../middlewares/initializeMetrics'
import getPaymentInfo from '../middlewares/payIds'
import sendSuccess from '../middlewares/sendSuccess'

const publicApiRouter = express.Router()

/**
 * Routes for the PayID Public API.
 */
publicApiRouter
  // Allow the PayID Protocol to basically ignore CORS
  .use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'PayID-Version')
    res.header(
      'Access-Control-Expose-Headers',
      'PayID-Version, PayID-Server-Version',
    )
    next()
  })

  // Welcome page route
  .get('/', (_req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, '../html/index.html'))
  })

  // Favicon route
  .get('/favicon.ico', (_req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, '../html/favicon.ico'))
  })

  // Health route
  .get('/status/health', sendSuccess)

  // PayID Discovery route
  .get('/.well-known/webfinger', constructJrd, sendSuccess)

  // Base PayID route
  .get(
    '/*',
    checkPublicApiVersionHeaders,
    initializeMetrics,
    wrapAsync(getPaymentInfo),
    sendSuccess,
  )

  // Error handling middleware (needs to be defined last)
  .use(errorHandler)

export default publicApiRouter
