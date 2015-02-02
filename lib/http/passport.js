var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var RememberStrategy = require('passport-remember-me').Strategy;


function Passport() {
    this.initialize();
}

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

    //configure strategies
    this.local();
    this.rememberMe();
};


Passport.prototype.local = function() {
    var verify = function(username, password, done) {
        var police = require('sails-police');

        police
            .getUser()
            .authenticate({
                email: username,
                password: password
            }, function(error, user) {
                //TODO handle error in friendly maner
                if (error) {
                    done(error);
                } else {
                    done(null, user);
                }
            });

        //attach local strategy into passport
        passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        }, verify));
    }
};

Passport.prototype.rememberMe = function() {
    // TODO implemen Rememberable morph
};