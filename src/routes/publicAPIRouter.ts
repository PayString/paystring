import * as express from 'express'

import getPaymentInfoFromPaymentPointer from '../services/paymentPointers'

import API from './API'

const publicAPIRouter = express.Router()

/**
 * routes for resolving payment pointers to addresses
 */
publicAPIRouter.get(
  '/*',
  getPaymentInfoFromPaymentPointer,
  API.setStatusToSuccessMiddleware(),
)

export default publicAPIRouter
