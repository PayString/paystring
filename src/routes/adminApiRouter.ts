import * as express from 'express'

import {
  checkRequestAdminApiVersionHeaders,
  checkRequestContentType,
  addAcceptPatchResponseHeader,
} from '../middlewares/adminApiHeaders'
import errorHandler, { wrapAsync } from '../middlewares/errorHandler'
import sendSuccess from '../middlewares/sendSuccess'
import {
  getUser,
  postUser,
  putUser,
  deleteUser,
  patchUserPayId,
} from '../middlewares/users'

const adminApiRouter = express.Router()

/**
 * Routes for the PayID Admin API.
 */
adminApiRouter
  // All /:payId requests should have an Accept-Patch response header with the PATCH mime type
  .use('/:payId', addAcceptPatchResponseHeader)

  // All [POST, PUT, PATCH] requests should have an appropriate Content-Type header,
  // AND all Admin API requests should have an appropriate PayID-API-Version header.
  .use('/*', checkRequestContentType, checkRequestAdminApiVersionHeaders)

  // Get user route
  .get('/:payId', wrapAsync(getUser), sendSuccess)

  // Create user route
  .post(
    '/',
    express.json(),
    // TODO:(hbergren) checkRequestContentType E2E tests,
    wrapAsync(postUser),
    sendSuccess,
  )

  // Replace user route
  .put(
    '/:payId',
    express.json(),
    // TODO:(hbergren) checkRequestContentType E2E tests,
    wrapAsync(putUser),
    sendSuccess,
  )

  // Delete user route
  .delete('/:payId', wrapAsync(deleteUser), sendSuccess)

  // Patch user's PayID route
  .patch(
    '/:payId',
    express.json({ type: 'application/merge-patch+json' }),
    wrapAsync(patchUserPayId),
    sendSuccess,
  )

  // Error handling middleware (needs to be defined last)
  .use(errorHandler)

export default adminApiRouter
