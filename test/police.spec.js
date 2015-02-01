var expect = require('chai').expect;
var faker = require('faker');
var police = require('sails-police')

describe('Police', function() {

    it('should have notification types constant', function(done) {
        expect(police.NOTIFICATION_TYPES).to.exist;

        expect(police.NOTIFICATION_TYPES).to.eql({
            REGISTRATION_CONFIRMATON: 'Registration confirmation',
            REGISTRATION_CONFIRMATON_RESEND: 'Registration confirmation resent',
            UNLOCK_CONFIRMATON: 'Unlock confirmation',
            UNLOCK_CONFIRMATON_RESEND: 'Unlock confirmation resent',
            PASSWORD_RECOVERY_CONFIRMATON: 'Password recovery confirmation',
            PASSWORD_RECOVERY_CONFIRMATON_RESEND: 'Password recovery confirmation resend'
        });

        done();
    });

    it('should have a default noop notification transport', function(done) {
        expect(police.transport).to.exist;
        expect(police).to.respondTo('transport');
        done();
    });

    it('should be able to tranpsort a given type of notification', function(done) {
        var authenticable = User.new({
            email: faker.internet.email(),
            password: faker.internet.password()
        });

        police
            .transport(
                police.NOTIFICATION_TYPES.REGISTRATION_CONFIRMATON,
                authenticable,
                done
            );

    });

    it('should be able to mixin its morphs to a given model', function(done) {
        var User = {}

        police.mixin(User);

        expect(User.authenticable).to.be.true;
        expect(User.confirmable).to.be.true;
        expect(User.lockable).to.be.true;
        expect(User.recoverable).to.be.true;
        expect(User.registerable).to.be.true;
        expect(User.trackable).to.be.true;

        done();
    });

});