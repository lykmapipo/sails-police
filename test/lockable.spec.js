var expect = require('chai').expect;

describe('Lockable', function() {
    it('should do have lockable attributes', function(done) {
        expect(User._attributes.failedAttempt).to.not.be.null;
        expect(User._attributes.lockedAt).to.not.be.null;
        expect(User._attributes.unlockToken).to.not.be.null;
        expect(User._attributes.unlockTokenSentAt).to.not.be.null;
        expect(User._attributes.unlockTokenExpiryAt).to.not.be.null;
        done();
    });
});