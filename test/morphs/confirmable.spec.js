var expect = require('chai').expect;

describe('Confirmable', function() {
    it('should do have confirmable attributes', function(done) {
        expect(User._attributes.confirmationToken).to.not.be.null;
        expect(User._attributes.confirmationTokenExpiryAt).to.not.be.null;
        expect(User._attributes.confirmedAt).to.not.be.null;
        expect(User._attributes.confirmationSentAt).to.not.be.null;
        done();
    });
});