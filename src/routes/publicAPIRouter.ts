import * as express from 'express'

import receiveComplianceData from '../middlewares/compliance'
import getInvoice, { parseInvoicePath } from '../middlewares/invoices'
import getPaymentInfo from '../middlewares/payIds'
import receiveReceipt from '../middlewares/receipts'
import sendSuccess from '../middlewares/sendSuccess'

const publicAPIRouter = express.Router()

/**
 * Routes for resolving PayIDs to addresses (and health check).
 */
publicAPIRouter
  // Health routes
  .get('/status/health', sendSuccess)

  // Invoice routes
  .get('/*/invoice', parseInvoicePath, getPaymentInfo, getInvoice, sendSuccess)
  .post(
    '/*/invoice',
    express.json(),
    receiveComplianceData,
    getInvoice,
    sendSuccess,
  )

  // Receipt routes
  .post('/*/receipt', express.json(), receiveReceipt, sendSuccess)

  // Base PayID routes
  .get('/*', getPaymentInfo, sendSuccess)

export default publicAPIRouter
