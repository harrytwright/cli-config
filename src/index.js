var nopt = require('nopt')
var inherits = require('inherits')

var { ConfigChain } = require('config-chain');

var { envReplace, parseField } = require('./utils');

module.exports.Configuration = Configuration;

module.exports = function(types, shorthand, defaults, argv = process.argv) {
    if (defaults === undefined) {
        if (!shorthand) {
            throw new Error('Requires the default values for all options');
        }

        defaults = shorthand;
        shorthand = { }
    }

    var options = nopt(types, shorthand, argv);
    var remain = options.argv.remain;
    delete options.remain

    var conf =  new Configuration(defaults);
    conf.add(options, 'cli');
    conf.add({ remain: remain }, 'argv');

    return conf;
};

inherits(Configuration, ConfigChain);
function Configuration(defaults) {
    ConfigChain.call(this);
    this.root = defaults
}

Configuration.prototype.add = function(data, marker) {
    try {
        Object.keys(data).forEach(function (k) {
            const newKey = envReplace(k)
            const newField = parseField(data[k], newKey)
            delete data[k]
            data[newKey] = newField
        })
    } catch (e) {
        this.emit('error', e);
        return this
    }

    ConfigChain.prototype.add.call(this, data, marker);
};
