var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// var RememberStrategy = require('passport-remember-me').Strategy;

/**
 * @description setup passortjs in sails-police
 */
function Passport() {
    this.initialize();
};

Passport.prototype.initialize = function() {
    //TODO encypt the id
    //passport serializer user on session
    passport
        .serializeUser(function(user, done) {
            done(null, user.id);
        });

    //passport deserializer user from session
    passport
        .deserializeUser(function(id, done) {
            var police = require('sails-police');

            police
                .getUser()
                .findOneById(id)
                .exec(function(error, user) {
                    //TODO custom error
                    //TODO undefined error
                    done(error, user);
                });
        });

    //configure passportjs strategies
    this.local();
    // this.rememberMe();
};


Passport.prototype.local = function() {

    function verify(email, password, done) {

        var police = require('sails-police');

        police
            .getUser()
            .authenticate({
                email: email,
                password: password
            }, function(error, user) {
                if (error) {
                    done(error);
                } else {
                    done(null, user);
                }
            });
    };

    //attach local strategy into passportjs
    passport
        .use('police-local', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        }, verify));

};

Passport.prototype.rememberMe = function() {
    // TODO implement Rememberable morph
};

module.exports = Passport;