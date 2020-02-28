import * as express from 'express'

import { getUser, postUser, putUser, deleteUser } from '../services/users'

import API from './API'

import bodyParser = require('body-parser')

const privateAPIRouter = express.Router()

/**
 * routes for the private API so that authorized parties can
 * post payment pointer mappings to the PayID DB
 */
privateAPIRouter
  .get('/', getUser, API.setStatusToSuccessMiddleware())
  .post('/', bodyParser.json(), postUser, API.setStatusToSuccessMiddleware())
  .put('/', bodyParser.json(), putUser, API.setStatusToSuccessMiddleware())
  .delete('/', deleteUser, API.setStatusToSuccessMiddleware())

export default privateAPIRouter
