import chai from 'chai'

import config from '../index'

const expect = chai.expect;

describe('cli', function () {

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
