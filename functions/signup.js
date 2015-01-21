/** @module authr-signup */
var async = require('async');



/**
 * @function
 * @name Signup
 * @param {Object} config - authr config
 * @param {Object} signup - cser object to be persisted to the database
 * @param {signupCallback} callback - callback to execute when signup finishes
 */
var Signup = function(config, signup, callback) {
    var self = this;
    async.waterfall([
        function(next) {
            config.Adapter.checkCredentials(signup, function(err, signup) {
                next(err, signup);
            });
        },
        function(signup, next) {
            config.Adapter.isValueTaken(signup, config.user.username, function(err, isTaken) {
                if (isTaken) {
                    next(config.errmsg.username_taken);
                } else {
                    next(null, signup);
                }
            });
        },
        function(signup, next) {
            if (config.user.username !== config.user.email_address) {
                config.Adapter.isValueTaken(signup, config.user.email_address, function(err, isTaken) {
                    if (isTaken) {
                        next(config.errmsg.email_address_taken);
                    } else {
                        next(null, signup);
                    }
                });
            } else {
                next(null, signup);
            }
        },
        function(signup, next) {

            if (config.security.hash_password) {

                config.Adapter.hashPassword(signup, signup, config.user.password, function(err, signup) {
                    next(err, signup);
                });
            } else {
                next(null, signup);
            }

        },
        function(signup, next) {
            if (config.security.max_failed_login_attempts) {
                config.Adapter.buildAccountSecurity(signup);
                next(null, signup);
            }
        },
        function(signup, next) {
            if (config.security.email_verification) {
                config.Adapter.doEmailVerification(signup, function(err, signup) {
                    next(err, signup);
                });
            } else {
                next(null, signup);
            }
        },
        function(signup, next) {
            config.Adapter.saveUser(signup, function(err, user) {
                next(err, user);
            });
        }
    ], function(err, user) {
        callback(err, user);
    });
};

/**
 * Handles signup response
 * @callback signupCallback
 * @param {String} err - error message, if it exists
 * @param {Object} user - user that the token was generated for
 */

module.exports = Signup;