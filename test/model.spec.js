var expect = require('chai').expect;

describe('#Models', function() {
    it('should have a push ability', function(done) {
        expect(Array.prototype.push).to.be.a('function');
        done();
    });
});