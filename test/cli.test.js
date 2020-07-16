import chai from 'chai'

import config from '../index'

const expect = chai.expect;

describe('cli', function () {

    describe('calling load with env variable', function () {

        describe('using default title', function () {
            var opts;

            before(function () {
                opts = config.parse({ path: require('path') }, {}, [], 0)
            });

            it('should return required value', function async(done) {
                process.env.node_config_path = process.cwd();

                config.load({ path: String }, opts, { }, function (config) {
                    expect(config.get('path')).to.eq(process.cwd());
                    done()
                });
            });

        });

        describe('using custom title', function () {
            var opts;

            before(function () {
                opts = config.parse({ path: require('path') }, {}, [], 0)
            });

            it('should return the valid value', function async(done) {
                process.title = 'test'
                process.env.test_config_path = process.cwd();

                config.load({ path: String }, opts, { }, function (config) {
                    expect(config.get('path')).to.equal(process.cwd());
                    done()
                });
            });

        });
    })

    describe('calling load', function () {
        var opts;

        before(function () {
            opts = config.parse({ key: String }, {}, ["--key", "myvalue"], 0)
        });

        it('should return required value', function async(done) {
            config.load({ key: String }, opts, { key: null }, function (config) {
                expect(config.get('key')).to.eq("myvalue");
                done()
            });
        });
    });

    describe('calling parse', function () {
        describe('with legit arguments', function () {
            it('should not throw an error', function () {
                expect(() => config.parse({ usage: Boolean })).to.not.throw();
            });
        });

        describe('with illegitimate arguments', function () {
            it('should throw an error', function () {
                expect(() => config.parse({ usage: Boolean }, process.argv)).to.throw();
            });
        });
    });
});
