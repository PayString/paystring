import * as express from 'express'

import {
  checkAdminApiVersionHeaders,
  checkContentType,
  addAcceptPatchHeader,
  addAllowHeader,
} from '../middlewares/checkAdminApiHeaders'
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
  // Get user route
  .get(
    '/*',
    checkAdminApiVersionHeaders,
    addAcceptPatchHeader,
    wrapAsync(getUser),
    sendSuccess,
  )

  // Create user route
  .post(
    '/',
    express.json(),
    checkAdminApiVersionHeaders,
    // TODO => checkContentType + E2E tests,
    wrapAsync(postUser),
    sendSuccess,
  )

  // Replace user route
  .put(
    '/*',
    express.json(),
    checkAdminApiVersionHeaders,
    addAcceptPatchHeader,
    // TODO => checkContentType + E2E tests,
    wrapAsync(putUser),
    sendSuccess,
  )

  // Delete user route
  .delete(
    '/*',
    checkAdminApiVersionHeaders,
    addAcceptPatchHeader,
    wrapAsync(deleteUser),
    sendSuccess,
  )

  // Options user PayID route
  .options(
    '/:payId',
    checkAdminApiVersionHeaders,
    addAcceptPatchHeader,
    addAllowHeader,
    sendSuccess,
  )

  // Patch user PayID route
  .patch(
    '/:payId',
    express.json({ type: 'application/merge-patch+json' }),
    checkAdminApiVersionHeaders,
    addAcceptPatchHeader,
    checkContentType,
    wrapAsync(patchUserPayId),
    sendSuccess,
  )

  // Error handling middleware (needs to be defined last)
  .use(errorHandler)

export default adminApiRouter
