import * as path from 'path'

import * as express from 'express'

import receiveComplianceData from '../middlewares/compliance'
import errorHandler, { wrapAsync } from '../middlewares/errorHandler'
import getInvoice, { parseInvoicePath } from '../middlewares/invoices'
import getPaymentInfo from '../middlewares/payIds'
import receiveReceipt from '../middlewares/receipts'
import sendSuccess from '../middlewares/sendSuccess'

const publicAPIRouter = express.Router()

/**
 * Routes for resolving PayIDs to addresses (and health check).
 */
publicAPIRouter
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

  // Invoice routes
  .get(
    '/*/invoice',
    wrapAsync(parseInvoicePath),
    wrapAsync(getPaymentInfo),
    wrapAsync(getInvoice),
    sendSuccess,
  )
  .post(
    '/*/invoice',
    express.json(),
    wrapAsync(receiveComplianceData),
    wrapAsync(getInvoice),
    sendSuccess,
  )

  // Receipt routes
  .post('/*/receipt', express.json(), wrapAsync(receiveReceipt), sendSuccess)

  // Base PayID routes
  .get('/*', wrapAsync(getPaymentInfo), sendSuccess)

  // Error handling middleware needs to be defined last
  .use(errorHandler)

export default publicAPIRouter
