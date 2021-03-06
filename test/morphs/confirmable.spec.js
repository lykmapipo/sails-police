var expect = require('chai').expect;
var faker = require('faker');
var async = require('async');

describe('Confirmable', function() {

    it('should have confirmable attributes', function(done) {
        expect(User._attributes.confirmationToken).to.exist;
        expect(User._attributes.confirmationTokenExpiryAt).to.exist;
        expect(User._attributes.confirmedAt).to.exist;
        expect(User._attributes.confirmationSentAt).to.exist;
        done();
    });

    it('should be able to generate confirmation token and set confirmation expriry at date', function(done) {
        var user = User.new({
            email: faker.internet.email(),
            username: faker.internet.userName(),
            password: faker.internet.password()
        });

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

    it('should be able to send confirmation email', function(done) {
        var user = User.new({
            email: faker.internet.email(),
            username: faker.internet.userName(),
            password: faker.internet.password()
        });

        expect(user.sendConfirmationEmail).to.be.a('function');

        user
            .sendConfirmationEmail(function(error, confirmable) {
                if (error) {
                    done(error);
                } else {
                    expect(confirmable.confirmationSentAt).to.not.be.null;
                    done();
                }
            });
    });

    it('should be able to confirm registration', function(done) {
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
                    function(confirmable, next) {
                        User
                            .confirm(confirmable.confirmationToken, next);
                    }
                ],
                function(error, confirmable) {
                    if (error) {
                        done(error);
                    } else {
                        expect(confirmable.confirmedAt).to.not.be.null;
                        done();
                    }
                });
    });
});