var lib = require('./src');

let config = lib({
    usage: Boolean,
    version: Boolean
}, {
    help: '--usage',
    v: '--version'
}, {
    usage: false,
    version: false
});

console.log(config.get('usage'));
