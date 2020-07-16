var nopt = require('nopt');
var aproba = require('aproba');
var inherits = require('inherits');

try {
    var debug = require('debug')('cli-config');
} catch (err) {
    debug = function() { };
}

const title = process.env.CLI_TITLE || process.title

var { ConfigChain } = require('config-chain');

var { envReplace, parseField } = require('./utils');

module.exports.Configuration = Configuration;
module.exports.parse = parse;
module.exports.load = load;

/**
 *
 * */
function load(types, cli, defaults, callback) {
    aproba('OOOF|OOO', arguments);

    // var remain = cli.argv.remain;

    var conf =  new Configuration(types, defaults);
    conf.add(cli, 'cli');
    conf.addEnv()
    // conf.set('argv', remain);

    if (callback) {
        conf.on('load', callback);
    }

    return conf;
}

/**
 *
 * */
function parse(types, shorthands, argv, slice) {
    aproba('OOAN|OOA|OO|O', arguments);
    debug('cli', argv);

    return nopt(...arguments);
}

inherits(Configuration, ConfigChain);
function Configuration(types, defaults) {
    ConfigChain.call(this);
    this.root = defaults;
    this.types = types;
}

Configuration.prototype.add = function(data, marker) {
    try {
        var self = this;
        Object.keys(data).forEach(function (k) {
            const newKey = envReplace(k);
            const newField = parseField(self.types, data[k], newKey);
            delete data[k];
            data[newKey] = newField
        })
    } catch (e) {
        this.emit('error', e);
        return this
    }

    ConfigChain.prototype.add.call(this, data, marker);
};

Configuration.prototype.addEnv = function (env) {
    env = env || process.env
    var conf = {}
    Object.keys(env)
        .filter(function (k) { return k.match(new RegExp(`^${title}_config_`, 'i')) })
        .forEach(function (k) {
            if (!env[k]) return

            // leave first char untouched, even if
            // it is a '_' - convert all other to '-'
            var p = k.toLowerCase()
                .replace(new RegExp(`^${title}_config_`), '')
                .replace(/(?!^)_/g, '-')
            conf[p] = env[k]
        })
    return ConfigChain.prototype.addEnv.call(this, '', conf, 'env')
}
