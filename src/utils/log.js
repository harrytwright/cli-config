/**
 * @typedef {('silly'|'verbose'|'info'|'warn'|'error')} ProcessLoggerLevel
 * */

/**
 * @callback ProcessLogger
 *
 * Internal logger to pass the values to any loggers listening.
 *
 * @param {...any} args
 * @returns {Boolean}
 * */

/**
 * Create a logger with a level
 *
 * @param {ProcessLoggerLevel} level
 *
 * @return {ProcessLogger}
 * */
const log = (level) => (...args) => process.emit('log', level, ...args)

for (const level of ['silly', 'verbose', 'info', 'warn', 'error']) {
  exports[level] = log(level)
}
