import chai from 'chai'

import config from '../index'

const expect = chai.expect;

describe('cli', function () {
    describe('calling init', function () {
        describe('passing a string results in a string', function () {
            it('should return required value', function () {
                var conf = config.init({ key: String }, {}, { key: null }, ["--key", "myvalue"], 0);
                expect(conf.get('key')).to.eq("myvalue");
            });
        });

        describe('using shorthand', function () {
            it('should return the required value', function () {
                var conf = config.init({
                    loglevel: ['silent', 'error', 'warn', 'notice', 'http', 'timing', 'info', 'verbose', 'silly']
                }, {
                    quiet: '--loglevel warn'
                }, {
                    loglevel: 'notice'
                }, [
                    "--quiet"
                ], 0);

                expect(conf.get('loglevel')).to.eq("warn");
            });
        });
    });


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
