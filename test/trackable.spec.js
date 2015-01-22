var expect = require('chai').expect;

describe('Trackable', function() {
    it('should do have trackable attributes', function(done) {
        expect(User._attributes.signInCount).to.not.be.null;
        expect(User._attributes.currentSignInAt).to.not.be.null;
        expect(User._attributes.currentSignIpAddress).to.not.be.null;
        expect(User._attributes.lastSignInAt).to.not.be.null;
        expect(User._attributes.lastSignIpAddress).to.not.be.null;
        done();
    });
});