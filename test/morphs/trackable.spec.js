var expect = require('chai').expect;
var faker = require('faker');

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
});