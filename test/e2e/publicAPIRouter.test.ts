import * as request from 'supertest'
import 'mocha'

import App from '../../src/app'

const app = new App()

describe('E2E - publicAPIRouter', function(): void {
  // Boot up Express application
  before(async function() {
    await app.init({ log: false, seedDatabase: false })
  })

  it('Returns a 200 for a GET /status/health', function(done): void {
    request(app.publicAPIExpress)
      .get('/status/health')
      .expect(200, "I'm alive!", done)
  })

  // Shut down Express application
  after(function() {
    app.close()
  })
})
