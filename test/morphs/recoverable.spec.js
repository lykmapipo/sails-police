var expect = require('chai').expect;
var faker = require('faker');

describe('Recoverable', function() {

    it('should have recoverable attributes', function(done) {
        expect(User._attributes.recoveryToken).to.exist;
        expect(User._attributes.recoveryTokenExpiryAt).to.exist;
        expect(User._attributes.recoverySentAt).to.exist;
        expect(User._attributes.recoveredAt).to.exist;
        done();
    });

    it('should be able to generate recovery token', function(done) {
        var user = User.new({
            email: faker.internet.email(),
            username: faker.internet.userName(),
            password: faker.internet.password()
        });

        expect(user.generateRecoveryToken).to.be.a('function');

        user
            .generateRecoveryToken(function(error, recoverable) {
                if (error) {
                    done(error)
                } else {
                    expect(recoverable.recoveryToken).to.not.be.null;
                    expect(recoverable.recoveryTokenExpiryAt).to.not.be.null;
                    done();
                }
            });

    });

    it('should be able to send recovery notification', function(done) {
        var user = User.new({
            email: faker.internet.email(),
            username: faker.internet.userName(),
            password: faker.internet.password()
        });

        expect(user.sendRecoveryEmail).to.be.a('function');

        user
            .sendRecoveryEmail(function(error, recoverable) {
                if (error) {
                    done(error);
                } else {
                    expect(recoverable.recoverySentAt).to.not.be.null;
                    done();
                }
            });
    });

    it('should be able to recover a password', function(done) {
        var previousPassord;

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
                    function(recoverable, next) {
                        recoverable.generateRecoveryToken(next);
                    },
                    function(recoverable, next) {
                        recoverable.sendRecoveryEmail(next);
                    },
                    function(recoverable, next) {
                        previousPassord = recoverable.password;

                        User
                            .recover(
                                recoverable.recoveryToken,
                                faker.internet.password(),
                                next
                            );
                    }
                ],
                function(error, recoverable) {
                    if (error) {
                        done(error);
                    } else {
                        expect(recoverable.password).to.not.be.null;
                        expect(recoverable.password).to.not.equal(previousPassord);
                        expect(recoverable.recoveredAt).to.not.be.null;
                        done();
                    }
                });
    });
});