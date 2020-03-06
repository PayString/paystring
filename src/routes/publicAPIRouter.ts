import * as express from 'express'

import getPaymentInfoFromPaymentPointer from '../services/paymentPointers'

import API from './API'

const publicAPIRouter = express.Router()

/**
 * routes for resolving payment pointers to addresses
 */
publicAPIRouter.get(
  '/status/health',
  (_req, res, next) => {
    res.status(200).send("I'm alive!")
    next()
  },
  API.setStatusToSuccessMiddleware(),
)
publicAPIRouter.get(
  '/*',
  getPaymentInfoFromPaymentPointer,
  API.setStatusToSuccessMiddleware(),
)

export default publicAPIRouter
