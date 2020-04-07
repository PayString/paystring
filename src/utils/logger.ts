import { configure, getLogger } from 'log4js'

import config from '../config'

// Log Levels
//
// OFF    Designates no log messages should be shown
// MARK   Designates an event that will almost always be logged. Useful for temporary logging.
// FATAL  Designates very severe error events that will presumably lead the application to abort.
// ERROR  Designates error events that might still allow the application to continue running.
// WARN   Designates potentially harmful situations.
// INFO   Designates informational messages that highlight the progress of the application at coarse-grained level.
// DEBUG  Designates fine-grained informational events that are most useful to debug an application.
// TRACE  Designates finer-grained informational events than the DEBUG.
// ALL    Designates all log events should be shown (equivalent to TRACE)

enum LogLevel {
  OFF = 'OFF',
  MARK = 'MARK',
  FATAL = 'FATAL',
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  TRACE = 'TRACE',
  ALL = 'ALL',
}

// Get the current log level from configuration
const LOG_LEVEL = config.app.log_level as LogLevel

configure({
  appenders: {
    out: {
      type: 'stdout',
      // Pattern Format documentation: https://github.com/log4js-node/log4js-node/blob/master/docs/layouts.md#pattern-format
      layout: { type: 'pattern', pattern: '%[%-5p%] %m' },
    },

    // Define a custom pattern to use when LOG_LEVEL=TRACE that includes filenames and line numbers in the log
    trace: {
      type: 'stdout',
      layout: { type: 'pattern', pattern: '%[%-5p %f:%-3l%]\t%m' },
    },
  },
  categories: {
    default: { appenders: ['out'], level: LOG_LEVEL },
    trace: { appenders: ['trace'], level: LOG_LEVEL, enableCallStack: true },
  },
})

let logCategory = 'default'
// If LOG_LEVEL = TRACE|ALL, use the logger that shows filenames and line numbers
if ([LogLevel.TRACE, LogLevel.ALL].includes(LOG_LEVEL)) {
  logCategory = 'trace'
}

const logger = getLogger(logCategory)

export default logger
