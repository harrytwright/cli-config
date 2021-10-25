# CLI Config

> Beta stage of a new change

A CLI options middleman for nopt

## Usage

```javascript
import Config from '@harrytwright/cli-config';

const types = {
    color: ['always', Boolean],
    host: String,
    loglevel: ['silent', 'error', 'warn', 'notice', 'http', 'timing', 'info', 'verbose', 'silly'],
    password: String,
    port: Number,
    database: String,
    usage: Boolean,
    username: String,
    version: Boolean
}

const defaults = {
    color: process.env.NO_COLOR == null,
    host: 'localhost',
    loglevel: 'notice',
    password: null,
    port: 27017,
    database: null,
    usage: false,
    username: null,
    version: false
}

const config = new Config({ defaults, types })
config.load()

config.get('port') // 27017
```
