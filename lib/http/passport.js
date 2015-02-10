var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var RememberMeStrategy = require('passport-remember-me').Strategy;

/**
 * @function
 * @author lykmapipo
 *
 * @description setup passortjs in sails-police
 */
function Passport() {
    this.initialize();
};

/**
 * @function
 * @author lykmapipo
 *
 * @description initialize sails police passport
 */
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
    this.rememberMe();
};

/**
 * @function
 * @author lykmapipo
 *
 * @description configure passport local strategy
 * @private
 */
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

/**
 * @function
 * @author lykmapipo
 *
 * @description configure passport remember-me strategy
 * @private
 */
Passport.prototype.rememberMe = function() {
    //consume remember me token and return user
    function consume(rememberMeToken, done) {
        var police = require('sails-police');

        police
            .getUser()
            .findOneByRememberMeToken(rememberMeToken)
            .exec(function(error, rememberable) {
                if (error) {
                    done(error);
                } else {
                    if (_.isUndefined(rememberable) ||
                        _.isNull(rememberable)) {
                        done(new Error('Invalid remember me token'));
                    } else {
                        done(null, rememberable);
                    }
                }
            });
    };

    //issue new remember me token
    function issue(rememberable, done) {
        rememberable
            .generateRememberMeToken(function(error, rememberable) {
                if (error) {
                    done(error);
                } else {
                    done(null, rememberable.rememberMeToken);
                }
            });
    };

    //attach remember me strategy into passportjs
    passport
        .use('police-remember-me', new RememberMeStrategy(
            consume,
            issue
        ));
};

/**
 * @description export sails passport 
 * @type {Passport}
 */
module.exports = Passport;