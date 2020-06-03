import * as path from 'path'

import * as express from 'express'

import checkPublicApiVersionHeaders from '../middlewares/checkPublicApiVersionHeaders'
import receiveComplianceData from '../middlewares/compliance'
import errorHandler, { wrapAsync } from '../middlewares/errorHandler'
import getPaymentInfo from '../middlewares/payIds'
import receivePaymentProof from '../middlewares/paymentProofs'
import getPaymentSetupDetails, {
  parsePaymentSetupDetailsPath,
} from '../middlewares/paymentSetupDetails'
import sendSuccess from '../middlewares/sendSuccess'

const publicAPIRouter = express.Router()

/**
 * Routes for resolving PayIDs to addresses (and health check).
 */
publicAPIRouter
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

  // Route to resolve the welcome page HTML
  .get('/', (_req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, '../html/index.html'))
  })

  // Route for the favicon
  .get('/favicon.ico', (_req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, '../html/favicon.ico'))
  })

  // Health routes
  .get('/status/health', sendSuccess)

  // PaymentSetupDetails routes
  .get(
    '/*/payment-setup-details',
    checkPublicApiVersionHeaders,
    wrapAsync(parsePaymentSetupDetailsPath),
    wrapAsync(getPaymentInfo),
    wrapAsync(getPaymentSetupDetails),
    sendSuccess,
  )
  .post(
    '/*/payment-setup-details',
    express.json(),
    checkPublicApiVersionHeaders,
    wrapAsync(receiveComplianceData),
    wrapAsync(getPaymentSetupDetails),
    sendSuccess,
  )

  // Payment proof routes
  .post(
    '/*/payment-proofs',
    express.json(),
    checkPublicApiVersionHeaders,
    wrapAsync(receivePaymentProof),
    sendSuccess,
  )

  // Base PayID routes
  .get(
    '/*',
    checkPublicApiVersionHeaders,
    wrapAsync(getPaymentInfo),
    sendSuccess,
  )

  // Error handling middleware needs to be defined last
  .use(errorHandler)

export default publicAPIRouter
