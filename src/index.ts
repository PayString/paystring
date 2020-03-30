import App from './app'
import config from './config'

function run(): void {
  if (require.main === module) {
    const app: App = new App()
    try {
      app.init(config)
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  }
}

run()
