import * as express from 'express'

import { getUser, postUser, deleteUser } from '../services/users'

import sendSuccess from './API'
import putUser from './users'

const privateAPIRouter = express.Router()

/**
 * routes for the private API so that authorized parties can
 * post payment pointer mappings to the PayID DB
 */
privateAPIRouter
  .get('/[$]*', getUser, sendSuccess)
  .post('/', express.json(), postUser, sendSuccess)
  .put('/*', express.json(), putUser, sendSuccess)
  .delete('/*', deleteUser, sendSuccess)

export default privateAPIRouter
