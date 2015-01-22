var expect = require('chai').expect;

describe('Recoverable', function() {
    it('should do have recoverable attributes', function(done) {
        expect(User._attributes.recoveryToken).to.not.be.null;
        expect(User._attributes.recoveryTokenExpiryAt).to.not.be.null;
        expect(User._attributes.recoveryTokenSentAt).to.not.be.null;
        done();
    });
});