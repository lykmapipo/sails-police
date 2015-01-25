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

    it('should be able to send confirmation', function(done) {
        expect(User.sendConfirmation).to.be.a('function');
        done();
    });
});