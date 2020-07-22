import * as express from 'express'

import {
  checkAdminApiVersionHeaders,
  checkContentType,
  addAcceptPatchHeader,
  addAllowHeader,
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
  // Options user PayID route
  .options(
    '/:payId',
    addAllowHeader,
    addAcceptPatchHeader,
    checkAdminApiVersionHeaders,
    sendSuccess,
  )

  // Get user route
  .get(
    '/*',
    addAcceptPatchHeader,
    checkAdminApiVersionHeaders,
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
    addAcceptPatchHeader,
    checkAdminApiVersionHeaders,
    // TODO => checkContentType + E2E tests,
    wrapAsync(putUser),
    sendSuccess,
  )

  // Delete user route
  .delete(
    '/*',
    addAcceptPatchHeader,
    checkAdminApiVersionHeaders,
    wrapAsync(deleteUser),
    sendSuccess,
  )

  // Patch user PayID route
  .patch(
    '/:payId',
    express.json({ type: 'application/merge-patch+json' }),
    addAcceptPatchHeader,
    checkAdminApiVersionHeaders,
    checkContentType,
    wrapAsync(patchUserPayId),
    sendSuccess,
  )

  // Error handling middleware (needs to be defined last)
  .use(errorHandler)

export default adminApiRouter
