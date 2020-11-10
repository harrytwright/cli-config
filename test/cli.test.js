import chai from 'chai'

import config from '../index'

const expect = chai.expect;

describe('cli', function () {

    describe('calling load with env variable', function () {
        var opts, env;

        before(function () {
            env = { PATH: process.cwd() }
            opts = new config({ }, { path: require('path') }, { PATH: 'path' }, { env })
            opts.load()
        });

        it('should return required value', function () {
            expect(opts.get('path')).to.eq(env.PATH);
        });
    })

    describe('calling load', function () {
        var opts, argv;

        before(function () {
            argv = ['', '', '--key', 'myvalue']
            opts = new config({}, { key: String }, {}, { argv  })
        });

        it('should return required value', function () {
            opts.load()
            expect(opts.get('key')).to.eq(argv.pop());
        });
    });
});
