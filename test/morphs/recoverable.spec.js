var expect = require('chai').expect;

describe('Recoverable', function() {
    
    it('should have recoverable static flag', function(done) {
        expect(User.recoverable).to.be.true;
        done();
    });

    it('should do have recoverable attributes', function(done) {
        expect(User._attributes.recoveryToken).to.exist;
        expect(User._attributes.recoveryTokenExpiryAt).to.exist;
        expect(User._attributes.recoveryTokenSentAt).to.exist;
        done();
    });
});