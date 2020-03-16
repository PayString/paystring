import * as express from 'express'

import sendSuccess from './API'
import getPaymentInfo from './paymentPointers'

const publicAPIRouter = express.Router()

/**
 * routes for resolving payment pointers to addresses (and health check)
 */
publicAPIRouter
  .get('/status/health', sendSuccess)
  .get('/*', getPaymentInfo, sendSuccess)

export default publicAPIRouter
