# CLI Config

A CLI options middleman for nopt

## Usage

```javascript
import conf from '@harrytwright/cli-config';

const config = conf.init( /* types */ {
    usage: Boolean,
    version: Boolean
}, /* Shorthands */ {
    help: '--usage',
    v: '--version'
}, /* Defaults */ {
    usage: false,
    version: false
});
```
