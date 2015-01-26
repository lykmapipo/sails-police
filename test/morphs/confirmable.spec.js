var expect = require('chai').expect;

describe('Confirmable', function() {
    it('should have confirmable static flag', function(done) {
        expect(User.confirmable).to.be.true;
        done();
    });

    it('should have confirmable attributes', function(done) {
        expect(User._attributes.confirmationToken).to.exist;
        expect(User._attributes.confirmationTokenExpiryAt).to.exist;
        expect(User._attributes.confirmedAt).to.exist;
        expect(User._attributes.confirmationSentAt).to.exist;
        done();
    });

    it('should be able to generate confirmation token and set confirmation expriry at date', function(done) {
        var user = User.new();

        expect(user.generateConfirmationToken).to.be.a('function');

        user
            .generateConfirmationToken(function(error, confirmable) {
                if (error) {
                    done(error)
                } else {
                    expect(confirmable.confirmationToken).to.not.be.null;
                    expect(confirmable.confirmationTokenExpiryAt).to.not.be.null;
                    done();
                }
            })
    });

    it('should be able to send confirmation', function(done) {
        var user = User.new({
            email: 'example@example.com',
            password: 'password'
        });

        expect(user.sendConfirmation).to.be.a('function');

        user
            .sendConfirmation(function(error, confirmable) {
                if (error) {
                    done(error);
                } else {
                    expect(confirmable.confirmationSentAt).to.not.be.null;
                    done();
                }
            });
    });
});