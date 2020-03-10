import { assert } from 'chai'
import * as request from 'supertest'
import 'mocha'

import App from '../src/app'

const app = new App()

describe('publicAPIRouter', function(): void {
  before(async function() {
    await app.init()
  })

  it('/status/health', function(done): void {
    request(app.publicAPIExpress)
      .get('/status/health')
      .expect(200)
      .then((response: request.Response) => {
        assert(response.text === "I'm alive!")
        done()
      })
      .catch(done)
  })

  after(function() {
    app.close()
  })
})
