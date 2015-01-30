var expect = require('chai').expect;

describe('Lockable', function() {

    it('should have lockable static flag', function(done) {
        expect(User.lockable).to.be.true;
        done();
    });

    it('should do have lockable attributes', function(done) {
        expect(User._attributes.failedAttempt).to.exist;
        expect(User._attributes.lockedAt).to.exist;
        expect(User._attributes.unlockedAt).to.exist;
        expect(User._attributes.unlockToken).to.exist;
        expect(User._attributes.unlockTokenSentAt).to.exist;
        expect(User._attributes.unlockTokenExpiryAt).to.exist;
        done();
    });

    it('should be able to generate lock token', function(done) {
        var user = User.new();

        expect(user.generateUnlockToken).to.be.a('function');

        user
            .generateUnlockToken(function(error, lockable) {
                if (error) {
                    done(error)
                } else {
                    expect(lockable.unlockToken).to.not.be.null;
                    expect(lockable.unlockTokenExpiryAt).to.not.be.null;
                    done();
                }
            });
    });

    it('should be able to send unlock instructions', function(done) {
        done();
    });

    it('should have lock ability', function(done) {
        done();
    });

    it('should have unlock ability', function(done) {
        done();
    });
});