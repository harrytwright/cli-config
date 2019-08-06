var nopt = require('nopt');
var aproba = require('aproba');
var inherits = require('inherits');

try {
    var debug = require('debug')('cli-config');
} catch (err) {
    debug = function() { };
}

var { ConfigChain } = require('config-chain');

var { envReplace, parseField } = require('./utils');

module.exports.Configuration = Configuration;
module.exports.parse = parse;
module.exports.load = load;
module.exports.init = init;

/**
 *
 * */
function init(types, shorthand, defaults, argv = process.argv, slice = 2) {
    if (defaults === undefined) {
        if (!shorthand) { throw new Error('Requires the default values for all options'); }

        defaults = shorthand;
        shorthand = { }
    }

    var options = parse(types, shorthand, argv, slice);
    var remain = options.argv.remain;
    delete options.argv.remain;

    var conf =  new Configuration(types, defaults);
    conf.add(options, 'cli');
    conf.set('argv', remain);

    return conf;
};

/**
 *
 * */
function load(types, cli, defaults, callback) {
    aproba('OOOF|OOO', arguments);

    var remain = cli.argv.remain;

    var conf =  new Configuration(types, defaults);
    conf.add(cli, 'cli');
    conf.set('argv', remain);

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
