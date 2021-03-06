var expect = require('chai').expect;
var faker = require('faker');
var async = require('async');

describe('Lockable', function() {

    it('should have lockable attributes', function(done) {
        expect(User._attributes.failedAttempts).to.exist;
        expect(User._attributes.lockedAt).to.exist;
        expect(User._attributes.unlockedAt).to.exist;
        expect(User._attributes.unlockToken).to.exist;
        expect(User._attributes.unlockSentAt).to.exist;
        expect(User._attributes.unlockTokenExpiryAt).to.exist;
        done();
    });

    it('should be able to generate unlock token', function(done) {
        var user = User.new({
            email: faker.internet.email(),
            username: faker.internet.userName(),
            password: faker.internet.password()
        });

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
        var user = User.new({
            email: faker.internet.email(),
            username: faker.internet.userName(),
            password: faker.internet.password()
        });

        expect(user.sendUnLockEmail).to.be.a('function');

        user
            .sendUnLockEmail(function(error, lockable) {
                if (error) {
                    done(error);
                } else {
                    expect(lockable.unlockTokenSentAt).to.not.be.null;
                    done();
                }
            });
    });

    it('should have lock ability', function(done) {
        var user = User.new({
            email: faker.internet.email(),
            username: faker.internet.userName(),
            password: faker.internet.password(),
            failedAttempts: 5
        });

        expect(user.lock).to.be.a('function');

        user
            .lock(function(error, lockable) {
                if (error) {
                    done(error);
                } else {
                    expect(lockable.lockedAt).to.not.be.null;
                    done();
                }
            });
    });

    it('should have unlock ability', function(done) {

        async
            .waterfall(
                [
                    function(next) {
                        User
                            .register({
                                email: faker.internet.email(),
                                username: faker.internet.userName(),
                                password: faker.internet.password()
                            }, next);
                    },
                    function(lockable, next) {
                        lockable.generateUnlockToken(next);
                    },
                    function(lockable, next) {
                        lockable.sendUnLockEmail(next);
                    },
                    function(lockable, next) {
                        User
                            .unlock(
                                lockable.unlockToken,
                                next
                            );
                    }
                ],
                function(error, lockable) {
                    if (error) {
                        done(error);
                    } else {
                        expect(lockable.unlockedAt).to.not.be.null;
                        expect(lockable.lockedAt).to.be.null;
                        expect(lockable.failedAttempts).to.equal(0)
                        done();
                    }
                });
    });
});