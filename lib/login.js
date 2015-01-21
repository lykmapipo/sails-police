/** @module authr-login */

var async = require('async');

/**
 * Check a user's password and return the user if it is correct.
 * @param {Object} config - authr configuration object
 * @param {Object} user - username and password supplied by the user. Should be {username: 'foo', password:'bar'}
 * @param {Callback} callback - Execute a callback when finished. Will contain err and user object.
 * @return {LoginCallback}
 */

var Login = function(config, login, callback) {
    async.waterfall([
        function(next) {
            config.Adapter.checkCredentials(login, function(err, user) {
                next(err, user);
            });
        },
        function(user, next) {
            config.Adapter.isValueTaken(login, config.user.username, function(err, user) {
                if (user) {
                    next(null, user);
                } else {
                    next(config.errmsg.username_not_found);
                }
            });
        },
        function(user, next) {
            if (config.security.max_failed_login_attempts) {
                config.Adapter.failedAttemptsExpired(user, function(err, reset) {
                    next(err, user);
                });
            } else {
                next(null, user);
            }
        },
        function(user, next) {
            config.Adapter.comparePassword(user, login, function(err, user) {
                next(err, user);
            });
        },
        function(user, next) {
            if (config.security.email_verification) {
                var isVerified = config.Adapter.isEmailVerified(user);
                if (isVerified) {
                    next(null, user);
                } else {
                    next({
                        err: config.errmsg.email_address_not_verified,
                        user: user
                    });
                }
            } else {
                next(null, user);
            }
        },
        function(user, next) {
            if (config.security.max_failed_login_attempts) {
                config.Adapter.isAccountLocked(user, function(err, isLocked) {
                    next(err, user);
                });
            } else {
                next(null, user);
            }
        }
    ], function(err, user) {
        callback(err, user);
    });
};

/**
 * Handles login response
 * @callback LoginCallback
 * @param {String} err - error, if it exists
 * @param {Object} user - user that was logged in
 */

module.exports = Login;