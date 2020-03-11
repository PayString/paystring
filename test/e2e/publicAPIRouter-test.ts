import * as request from 'supertest'
import 'mocha'

import App from '../../src/app'

const app = new App()

describe('publicAPIRouter', function(): void {
  before(async function() {
    await app.init()
  })

  it('Returns a 200 for a GET /status/health', function(done): void {
    request(app.publicAPIExpress)
      .get('/status/health')
      .expect(200, "I'm alive!", done)
  })

  after(function() {
    app.close()
  })
})
