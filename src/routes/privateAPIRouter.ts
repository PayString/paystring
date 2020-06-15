import * as express from 'express'

import checkPrivateApiVersionHeaders from '../middlewares/checkPrivateApiVersionHeaders'
import errorHandler, { wrapAsync } from '../middlewares/errorHandler'
import sendSuccess from '../middlewares/sendSuccess'
import { getUser, postUser, putUser, deleteUser } from '../middlewares/users'

const privateAPIRouter = express.Router()

/**
 * Routes for the PayID Private API.
 */
privateAPIRouter
  // Get user route
  .get('/*', checkPrivateApiVersionHeaders, wrapAsync(getUser), sendSuccess)

  // Create user route
  .post(
    '/',
    express.json(),
    checkPrivateApiVersionHeaders,
    wrapAsync(postUser),
    sendSuccess,
  )

  // Replace user route
  .put(
    '/*',
    express.json(),
    checkPrivateApiVersionHeaders,
    wrapAsync(putUser),
    sendSuccess,
  )

  // Delete user route
  .delete(
    '/*',
    checkPrivateApiVersionHeaders,
    wrapAsync(deleteUser),
    sendSuccess,
  )

  // Error handling middleware (needs to be defined last)
  .use(errorHandler)

export default privateAPIRouter
