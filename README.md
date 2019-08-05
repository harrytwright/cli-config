# CLI Config

A CLI options middleman for nopt

## Usage

```javascript
import load from '@harrytwright/cli-config';

const config = load( /* types */ {
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
