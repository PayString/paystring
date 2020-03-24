import * as express from 'express'

import getPaymentInfo from '../middlewares/paymentPointers'
import sendSuccess from '../middlewares/shared'

const publicAPIRouter = express.Router()

/**
 * routes for resolving payment pointers to addresses (and health check)
 */
publicAPIRouter
  .get('/status/health', sendSuccess)
  .get('/*', getPaymentInfo, sendSuccess)

export default publicAPIRouter
