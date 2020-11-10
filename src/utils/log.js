const log = (level) => (...args) => process.emit('log', level, ...args)

for (const level of ['silly', 'verbose', 'info', 'warn', 'error']) {
  module.exports[level] = log(level)
}
