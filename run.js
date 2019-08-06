var lib = require('./index');

let config = lib.init({
    color: ['always', Boolean],
    host: String,
    loglevel: ['silent', 'error', 'warn', 'notice', 'http', 'timing', 'info', 'verbose', 'silly'],
    password: String,
    post: Number,
    database: String,
    usage: Boolean,
    username: String,
    version: Boolean
}, { }, {
    color: process.env.NO_COLOR == null,
    host: 'localhost',
    loglevel: 'notice',
    password: null,
    post: 27017,
    database: null,
    usage: false,
    username: null,
    version: false
});

console.log(config.get('host'));
