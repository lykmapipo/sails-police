var expect = require('chai').expect;
var faker = require('faker');

describe('Recoverable', function() {

    it('should have recoverable static flag', function(done) {
        expect(User.recoverable).to.be.true;
        done();
    });

    it('should have recoverable attributes', function(done) {
        expect(User._attributes.recoveryToken).to.exist;
        expect(User._attributes.recoveryTokenExpiryAt).to.exist;
        expect(User._attributes.recoverySentAt).to.exist;
        expect(User._attributes.recoveredAt).to.exist;
        done();
    });

    it('should be able to generate recovery token', function(done) {
        var user = User.new();

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
            password: faker.internet.password()
        });

        expect(user.sendRecovery).to.be.a('function');

        user
            .sendRecovery(function(error, recoverable) {
                if (error) {
                    done(error);
                } else {
                    expect(recoverable.recoverySentAt).to.not.be.null;
                    done();
                }
            });
    });

    it('should be able to recover a password', function(done) {
        done();
    });
});