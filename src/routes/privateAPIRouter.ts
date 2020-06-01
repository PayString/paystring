import * as express from 'express'

import checkPrivateApiVersionHeaders from '../middlewares/checkPrivateApiVersionHeaders'
import errorHandler, { wrapAsync } from '../middlewares/errorHandler'
import sendSuccess from '../middlewares/sendSuccess'
import { getUser, postUser, putUser, deleteUser } from '../middlewares/users'

const privateAPIRouter = express.Router()

/**
 * Routes for the private API so that authorized parties can post PayID mappings to the PayID database.
 */
privateAPIRouter
  .get('/*', checkPrivateApiVersionHeaders, wrapAsync(getUser), sendSuccess)
  .post(
    '/',
    express.json(),
    checkPrivateApiVersionHeaders,
    wrapAsync(postUser),
    sendSuccess,
  )
  .put(
    '/*',
    express.json(),
    checkPrivateApiVersionHeaders,
    wrapAsync(putUser),
    sendSuccess,
  )
  .delete(
    '/*',
    checkPrivateApiVersionHeaders,
    wrapAsync(deleteUser),
    sendSuccess,
  )

  // Error handling middleware needs to be defined last
  .use(errorHandler)

export default privateAPIRouter
