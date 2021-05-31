const path = require('path')

module.exports.parseField = parseField

const isWindows = module.exports.isWindows = process.platform === 'win32'

/**
 * Check if the values is a valid type can convert it
 *
 * @param {Object} types - types for type checker
 * @param {any} f - value
 * @param {string} k - key
 *
 * @internal
 * */
function parseField (types, f, k) {
  if (typeof f !== 'string' && !(f instanceof String)) { return f }

  // type can be an array or single thing.
  const typeList = [].concat(types[k])
  const isPath = typeList.indexOf(path) !== -1
  const isBool = typeList.indexOf(Boolean) !== -1
  const isString = typeList.indexOf(String) !== -1
  const isNumber = typeList.indexOf(Number) !== -1

  f = ('' + f).trim()

  if (f.match(/^".*"$/)) {
    try {
      f = JSON.parse(f)
    } catch (e) {
      throw new Error('Failed parsing JSON config key ' + k + ': ' + f)
    }
  }

  if (isBool && !isString && f === '') {
    return true
  }

  switch (f) {
    case 'true':
      return true
    case 'false':
      return false
    case 'null':
      return null
    case 'undefined':
      return undefined
  }

  f = envReplace(f)

  if (isPath) {
    const homePattern = isWindows ? /^~(\/|\\)/ : /^~\//
    if (f.match(homePattern) && process.env.HOME) {
      f = path.resolve(process.env.HOME, f.substr(2))
    }
    f = path.resolve(f)
  }

  if (isNumber && !isNaN(f)) {
    f = +f
  }

  return f
}

function envReplace (f) {
  if (typeof f !== 'string' || !f) { return f }

  // replace any ${ENV} values with the appropriate environ.
  const envExpr = /(\\*)\$\{([^}]+)\}/g
  return f.replace(envExpr, function (orig, esc, name) {
    esc = esc.length && esc.length % 2
    if (esc) { return orig }
    if (undefined === process.env[name]) {
      throw new Error('Failed to replace env in config: ' + orig)
    }

    return process.env[name]
  })
}
