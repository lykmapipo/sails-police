var expect = require('chai').expect;

describe('Authenticable', function() {
    it('should do have registerable attributes', function(done) {
        expect(User._attributes.registeredAt).to.not.be.null;
        done();
    });
});