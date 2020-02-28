import * as express from 'express'

import getAddressFromPaymentPointer from '../services/paymentPointers'

import API from './API'

const publicAPIRouter = express.Router()

/**
 * routes for resolving payment pointers to addresses
 */
publicAPIRouter.get(
  '/',
  getAddressFromPaymentPointer,
  API.setStatusToSuccessMiddleware(),
)

export default publicAPIRouter
