var expect = require('chai').expect;
var faker = require('faker');
var async = require('async');

var previousIp = faker.internet.ip();
var currentIp = faker.internet.ip();
var email = faker.internet.email();

describe('Trackable', function() {

    it('should have trackable static flag', function(done) {
        expect(User.trackable).to.be.true;
        done();
    });

    it('should do have trackable attributes', function(done) {
        expect(User._attributes.signInCount).to.exist;
        expect(User._attributes.currentSignInAt).to.exist;
        expect(User._attributes.currentSignInIpAddress).to.exist;
        expect(User._attributes.lastSignInAt).to.exist;
        expect(User._attributes.lastSignInIpAddress).to.exist;
        done();
    });

    it('should be able to set trackable details', function(done) {

        var trackable = User.new({
            email: email,
            username: faker.internet.userName(),
            password: faker.internet.password()
        });

        expect(trackable.track).to.exist;
        expect(trackable).to.respondTo('track');

        trackable
            .track(previousIp, function(error, trackable) {
                if (error) {
                    done(error);
                } else {
                    expect(trackable.currentSignInAt).to.not.be.null;
                    expect(trackable.currentSignInIpAddress).to.not.be.null;
                    expect(trackable.currentSignInIpAddress).to.equal(previousIp);
                    done();
                }
            });
    });

    it('should be able to update tracking details', function(done) {
        var lastSignInAt;

        async
            .waterfall(
                [
                    function(next) {
                        User
                            .findOneByEmail(email)
                            .exec(function(error, trackable) {
                                next(error, trackable);
                            });
                    },
                    function(trackable, next) {
                        lastSignInAt = trackable.currentSignInAt;

                        expect(trackable.signInCount).to.equal(1);
                        expect(trackable.currentSignInAt).to.not.be.null;
                        expect(trackable.currentSignInIpAddress).to.not.be.null;
                        expect(trackable.currentSignInIpAddress).to.equal(previousIp);

                        next(null, trackable);
                    },
                    function(trackable, next) {
                        trackable.track(currentIp, next)
                    }
                ],
                function(error, trackable) {
                    if (error) {
                        done(error);
                    } else {
                        expect(trackable.signInCount).to.equal(2);

                        expect(trackable.lastSignInAt).to.not.be.null;
                        expect(trackable.lastSignInAt.getTime())
                            .to.equal(lastSignInAt.getTime());

                        expect(trackable.lastSignInIpAddress).to.not.be.null;
                        expect(trackable.lastSignInIpAddress).to.equal(previousIp);

                        expect(trackable.currentSignInAt).to.not.be.null;
                        expect(trackable.currentSignInIpAddress).to.not.be.null;
                        expect(trackable.currentSignInIpAddress).to.equal(currentIp);

                        done();
                    }
                });
    });
});