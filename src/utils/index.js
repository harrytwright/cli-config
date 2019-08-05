var path = require('path');

module.exports.parseField = parseField;
module.exports.envReplace = envReplace;

let isWindows = module.exports.isWindows = process.platform === 'win32';

function parseField (f, k) {
    if (typeof f !== 'string' && !(f instanceof String)) return f

    // type can be an array or single thing.
    var typeList = [].concat(types[k])
    var isPath = typeList.indexOf(path) !== -1
    var isBool = typeList.indexOf(Boolean) !== -1
    var isString = typeList.indexOf(String) !== -1
    var isNumber = typeList.indexOf(Number) !== -1

    f = ('' + f).trim()

    if (f.match(/^".*"$/)) {
        try {
            f = JSON.parse(f)
        } catch (e) {
            throw new Error('Failed parsing JSON config key ' + k + ': ' + f)
        }
    }

    if (isBool && !isString && f === '') { return true }

    switch (f) {
        case 'true': return true
        case 'false': return false
        case 'null': return null
        case 'undefined': return undefined
    }

    f = envReplace(f)

    if (isPath) {
        var homePattern = isWindows ? /^~(\/|\\)/ : /^~\//
        if (f.match(homePattern) && process.env.HOME) {
            f = path.resolve(process.env.HOME, f.substr(2))
        }
        f = path.resolve(f)
    }

    if (isNumber && !isNaN(f)) { f = +f }

    return f
}

function envReplace (f) {
    if (typeof f !== 'string' || !f) { return f }

    // replace any ${ENV} values with the appropriate environ.
    var envExpr = /(\\*)\$\{([^}]+)\}/g
    return f.replace(envExpr, function (orig, esc, name) {
        esc = esc.length && esc.length % 2
        if (esc) { return orig }
        if (undefined === process.env[name]) {
            throw new Error('Failed to replace env in config: ' + orig)
        }

        return process.env[name]
    })
}
