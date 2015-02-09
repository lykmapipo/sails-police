var expect = require('chai').expect;
var faker = require('faker');
var police = require('sails-police');
var _ = require('lodash');

var police = require('sails-police');

describe('Police', function() {

    it('should have notification types constant', function(done) {


        expect(police.EMAIL_REGISTRATION_CONFIRMATON).to.exist;
        expect(police.EMAIL_UNLOCK).to.exist;
        expect(police.EMAIL_PASSWORD_RECOVERY).to.exist;

        done();
    });


    it('should be able to send a given type of notification', function(done) {
        var authenticable = User.new({
            email: faker.internet.email(),
            password: faker.internet.password()
        });

        authenticable
            .sendEmail(
                police.EMAIL_REGISTRATION_CONFIRMATON,
                authenticable,
                done
            );

    });

    it('should be able to mixin its morphs to a given sails model', function(done) {
        var User = {}

        police.model.mixin(User);

        expect(_.keys(User)).to.include.members(['new', 'confirm']);

        done();
    });

    it('should have default sails model to use', function(done) {
        var Model = police.getUser();
        expect(Model).to.not.be.null;
        done();
    });

});