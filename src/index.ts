import App from './app'
import config from './config'
import logger from './utils/logger'

function run(): void {
  if (require.main === module) {
    const app: App = new App()
    app.init(config).catch((err) => {
      logger.fatal(err)
      process.exit(1)
    })
  }
}

run()
