import reduct from 'reduct'

import App from './app'

async function run(): Promise<void> {
  if (require.main === module) {
    const app: App = reduct()(App)
    try {
      await app.init()
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  }
}

run()
