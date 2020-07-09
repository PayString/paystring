import * as express from 'express'

import {
  checkAdminApiVersionHeaders,
  checkAdminApiContentTypeHeaders,
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
import { MediaType } from '../utils/errors'

const adminApiRouter = express.Router()

/**
 * Routes for the PayID Admin API.
 */
adminApiRouter
  // Get user route
  .get('/*', checkAdminApiVersionHeaders, wrapAsync(getUser), sendSuccess)

  // Create user route
  .post(
    '/',
    express.json(),
    checkAdminApiVersionHeaders,
    // TODO -> checkAdminApiContentTypeHeaders for application/json
    wrapAsync(postUser),
    sendSuccess,
  )

  // Replace user route
  .put(
    '/*',
    express.json(),
    checkAdminApiVersionHeaders,
    // TODO -> checkAdminApiContentTypeHeaders for application/json
    wrapAsync(putUser),
    sendSuccess,
  )

  // Delete user route
  .delete('/*', checkAdminApiVersionHeaders, wrapAsync(deleteUser), sendSuccess)

  // Patch user PayID route
  .patch(
    '/:payId',
    express.json({ type: MediaType.ApplicationMergePatchJson }),
    checkAdminApiVersionHeaders,
    checkAdminApiContentTypeHeaders,
    wrapAsync(patchUserPayId),
    sendSuccess,
  )

  // Error handling middleware (needs to be defined last)
  .use(errorHandler)

export default adminApiRouter
