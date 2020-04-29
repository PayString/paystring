import * as express from 'express'

import errorHandler, { wrapAsync } from '../middlewares/errorHandler'
import sendSuccess from '../middlewares/sendSuccess'
import { getUser, postUser, putUser, deleteUser } from '../middlewares/users'

const privateAPIRouter = express.Router()

/**
 * Routes for the private API so that authorized parties can post PayID mappings to the PayID DB
 */
privateAPIRouter
  .get('/*', wrapAsync(getUser), sendSuccess)
  .post('/', express.json(), wrapAsync(postUser), sendSuccess)
  .put('/*', express.json(), wrapAsync(putUser), sendSuccess)
  .delete('/*', wrapAsync(deleteUser), sendSuccess)

  // Error handling middleware needs to be defined last
  .use(errorHandler)

export default privateAPIRouter
