import * as express from 'express'

import checkAdminApiVersionHeaders from '../middlewares/checkAdminApiVersionHeaders'
import errorHandler, { wrapAsync } from '../middlewares/errorHandler'
import sendSuccess from '../middlewares/sendSuccess'
import { getUser, postUser, putUser, deleteUser } from '../middlewares/users'

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
    wrapAsync(postUser),
    sendSuccess,
  )

  // Replace user route
  .put(
    '/*',
    express.json(),
    checkAdminApiVersionHeaders,
    wrapAsync(putUser),
    sendSuccess,
  )

  // Delete user route
  .delete('/*', checkAdminApiVersionHeaders, wrapAsync(deleteUser), sendSuccess)

  // Error handling middleware (needs to be defined last)
  .use(errorHandler)

export default adminApiRouter
