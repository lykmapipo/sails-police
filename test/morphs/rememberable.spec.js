var expect = require('chai').expect;
var faker = require('faker');
var async = require('async');

describe('Rememberable', function() {

    it('should have rememberable attributes', function(done) {
        expect(User._attributes.rememberMeToken).to.exist;
        expect(User._attributes.rememberMeTokenIssuedAt).to.exist;
        done();
    });

    it('should be able to generate remember me token', function(done) {
        var user = User.new({
            email: faker.internet.email(),
            username: faker.internet.userName(),
            password: faker.internet.password()
        });

        expect(user.generateRememberMeToken).to.be.a('function');

        user
            .generateRememberMeToken(function(error, rememberable) {
                if (error) {
                    done(error)
                } else {
                    expect(rememberable.rememberMeToken).to.not.be.null;
                    expect(rememberable.rememberMeTokenIssuedAt).to.not.be.null;
                    done();
                }
            });
    });
});