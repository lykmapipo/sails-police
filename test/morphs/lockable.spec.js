var expect = require('chai').expect;

describe('Lockable', function() {
    it('should have lockable static flag', function(done) {
        expect(User.lockable).to.be.true;
        done();
    });

    it('should do have lockable attributes', function(done) {
        expect(User._attributes.failedAttempt).to.exist;
        expect(User._attributes.lockedAt).to.exist;
        expect(User._attributes.unlockToken).to.exist;
        expect(User._attributes.unlockTokenSentAt).to.exist;
        expect(User._attributes.unlockTokenExpiryAt).to.exist;
        done();
    });
});