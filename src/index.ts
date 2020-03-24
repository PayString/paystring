import App from './app'

function run(): void {
  if (require.main === module) {
    const app: App = new App()
    try {
      app.init()
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  }
}

run()
