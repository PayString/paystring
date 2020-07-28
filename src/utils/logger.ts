import createLogger from '@xpring-eng/logger'

import config from '../config'

const logger = createLogger(config.app.logLevel)

export default logger
