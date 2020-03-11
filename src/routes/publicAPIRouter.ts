import * as express from 'express'

import API from './API'
import getPaymentInfo from './paymentPointers'

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
publicAPIRouter.get('/*', getPaymentInfo, API.setStatusToSuccessMiddleware())

export default publicAPIRouter
