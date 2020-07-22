import HttpStatus from '@xpring-eng/http-status'
import * as request from 'supertest'

import App from '../../../../src/app'
import { appSetup } from '../../../helpers/helpers'

// eslint-disable-next-line node/file-extension-in-import -- typescript needs .json extension
import * as discoveryLinks from './testDiscoveryLinks.json'

let app: App

describe('E2E - publicAPIRouter - PayID Discovery', function (): void {
  // Boot up Express application and initialize DB connection pool
  before(async function () {
    app = await appSetup()
  })

  it('Discovery query returns JRD', function (done): void {
    // GIVEN a PayID
    const payId = 'alice$wallet.com'
    const expectedResponse = {
      subject: payId,
      discoveryLinks,
    }

    // WHEN we make a GET request to the PayID Discovery endpoint
    request(app.publicApiExpress)
      .get(`/.well-known/webfinger?resource=${payId}`)
      // THEN we get back a JRD with subject = the PayID and all links from the discoveryLinks.json file
      .expect(HttpStatus.OK, expectedResponse, done)
  })
})
