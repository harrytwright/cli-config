const chai = require('chai')

const config = require('../index')

const expect = chai.expect;

describe('cli', function () {

    describe('calling load with env variable', function () {
        var opts, env;

        before(function () {
            env = { PATH: process.cwd() }
            opts = new config({ types: { path: require('path') }, envMap: { PATH: 'path' }, env })
        });

        it('should return required value', function () {
            opts.load()
            expect(opts.get('path')).to.eq(env.PATH);
        });
    })

    describe('calling load', function () {
        describe('simple arg', function () {
            var opts, argv;

            before(function () {
                argv = ['', '', '--key', 'myvalue']
                opts = new config({ types: { key: String }, argv })
            });

            it('should return required value', function () {
                opts.load()
                expect(opts.get('key')).to.eq(argv.pop());
            });
        });

        describe('use case arg', function () {
            var opts, argv;

            before(function () {
                argv = ['', '', '--database-collection', 'myvalue']
                opts = new config({ defaults: { 'database-collection': 'something else' }, types: { 'database-collection': String }, argv })
            });

            it('should return required value', function () {
                opts.load()
                expect(opts.get('database-collection')).to.eq(argv.pop());
            });
        });

        describe('calling load multiple times', function () {
            var opts, argv;

            before(function () {
                argv = ['', '', '--database-collection', 'myvalue']
                opts = new config({ defaults: { 'database-collection': 'something else' }, types: { 'database-collection': String }, argv })
                opts.load()
            });

            it('should return required value', function () {
                expect(() => opts.load()).to.throw()
            });
        });

        describe('calling get before loaded', function () {
            var opts, argv;

            before(function () {
                argv = ['', '', '--database-collection', 'myvalue']
                opts = new config({ defaults: { 'database-collection': 'something else' }, types: { 'database-collection': String }, argv })
            });

            it('should return required value', function () {
                expect(() => opts.get('database-collection')).to.throw()
            });
        });
    });

    describe('get', function () {
        it('should throw error on invalid storage', function () {
            const env = { PATH: process.cwd() }
            const opts = new config({ types: { path: require('path') }, envMap: { PATH: 'path' }, env })

            opts.load()
            expect(() => opts.get('invalid', 'invalid')).to.throw()
        });
    });

    describe('set', function () {
        it('should set an object', function () {
            const env = { PATH: process.cwd() }
            const opts = new config({ types: { path: require('path') }, envMap: { PATH: 'path' }, env })
            opts.load()

            opts.set('key', 'value')
            expect(opts.get('key')).to.be.eq('value')
        });

        it('should throw when not loaded', function () {
            const env = { PATH: process.cwd() }
            const opts = new config({ types: { path: require('path') }, envMap: { PATH: 'path' }, env })

            expect(() => opts.set('key', 'value')).to.throw()
        });

        it('should set an object', function () {
            const env = { PATH: process.cwd() }
            const opts = new config({ types: { path: require('path') }, envMap: { PATH: 'path' }, env })
            opts.load()

            expect(() => opts.set('key', 'value', 'invalid')).to.throw()
        });
    });
});
