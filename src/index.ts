import App from './app'
import config from './config'
import logger from './utils/logger'

function run(): void {
  if (require.main === module) {
    const app: App = new App()
    try {
      app.init(config)
    } catch (e) {
      logger.fatal(e)
      process.exit(1)
    }
  }
}

run()
