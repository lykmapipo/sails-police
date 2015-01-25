var expect = require('chai').expect;

describe('Authenticable', function() {
    it('should have authenticable static flag', function(done) {
        expect(User.authenticable).to.be.true;
        done();
    });

    it('should have username and password attributes', function(done) {
        expect(User._attributes.email).to.exist;
        expect(User._attributes.password).to.exist;
        done();
    });

    it('should be able to generate token', function(done) {
        expect(User.generateToken).to.be.a('function');

        User
            .generateToken(function(error, token) {

                if (error) {
                    done(error);
                } else {
                    expect(token).to.not.be.null;
                    done();
                }
            });
    });

    it('should be able to encrypt password', function(done) {
        expect(User.encryptPassword).to.be.a("function");

        User
            .encryptPassword('password', function(error, hash) {

                if (error) {
                    done(error);
                }

                expect(hash).to.not.equal('password');
                done();
            });
    });

    it('should be able to compare password with hash', function(done) {
        expect(User.comparePassword).to.be.a("function");

        User
            .encryptPassword('password', function(error, hash) {
                if (error) {
                    done(error);
                }

                User
                    .comparePassword('password', hash, function(error, result) {
                        if (error) {
                            done(error);
                        }

                        expect(result).to.be.true;

                        done();
                    });

            });
    });

});