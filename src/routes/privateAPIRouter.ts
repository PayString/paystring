import * as express from 'express'

import { getUser, postUser, putUser, deleteUser } from '../services/users'

import API from './API'

const privateAPIRouter = express.Router()

/**
 * routes for the private API so that authorized parties can
 * post payment pointer mappings to the PayID DB
 */
privateAPIRouter
  .get('/', getUser, API.setStatusToSuccessMiddleware())
  .post('/', express.json(), postUser, API.setStatusToSuccessMiddleware())
  .put('/', express.json(), putUser, API.setStatusToSuccessMiddleware())
  .delete('/', deleteUser, API.setStatusToSuccessMiddleware())

export default privateAPIRouter
