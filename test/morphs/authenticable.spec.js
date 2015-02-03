var expect = require('chai').expect;
var faker = require('faker');
var async = require('async');

describe('Authenticable', function() {

    it('should have authenticable static flag', function(done) {
        expect(User.authenticable).to.be.true;
        done();
    });

    it('should have username and password attributes', function(done) {
        expect(User._attributes.email).to.exist;
        expect(User._attributes.username).to.exist;
        expect(User._attributes.password).to.exist;
        done();
    });


    it('should be able to encrypt password', function(done) {
        var password = faker.internet.password();
        var user = User.new({
            password: password
        });

        expect(user.encryptPassword).to.be.a("function");

        user
            .encryptPassword(function(error, authenticable) {

                if (error) {
                    done(error);
                } else {

                    expect(authenticable.password).to.not.equal(password);
                    done();
                }
            });
    });

    it('should be able to compare password with hash', function(done) {
        var password = faker.internet.password();

        var user = User.new({
            password: password
        });

        expect(user.comparePassword).to.be.a("function");

        async
            .waterfall(
                [
                    function(next) {
                        user.encryptPassword(next)
                    },
                    function(authenticable, next) {
                        authenticable
                            .comparePassword(password, next);
                    }
                ],
                function(error, authenticable) {
                    if (error) {
                        done(error);
                    } else {
                        expect(authenticable).to.not.be.null;
                        done();
                    }
                });

    });


    it('should have authenticate method', function(done) {
        expect(User.authenticate).to.exist;
        expect(User.authenticate).to.be.a('function');
        done();
    });

    it('should be able to authenticate registerable', function(done) {
        var credentials = {
            email: faker.internet.email(),
            username: faker.internet.userName(),
            password: faker.internet.password()
        }

        async
            .waterfall(
                [
                    function(next) {
                        User
                            .register(credentials, next);
                    },
                    function(registerable, next) {
                        User
                            .authenticate(credentials, next);
                    },
                    function(registerable, next) {
                        expect(registerable).to.not.be.null;
                        next(null, registerable)
                    }
                ],
                function(error, registerable) {
                    if (error) {
                        done(error);
                    } else {
                        done();
                    }
                });
    });

});