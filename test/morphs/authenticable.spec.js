var expect = require('chai').expect;

describe('Authenticable', function() {
    it('should do have username and password attributes', function(done) {
        expect(User._attributes.email).to.not.be.null;
        expect(User._attributes.password).to.not.be.null;
        done();
    });
});