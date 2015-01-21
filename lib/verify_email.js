/** @module authr-verify */
var async = require('async');

/**
 * Verify a user's email address
 * @param {Object} config - authr configuration object
 * @param {String} token - token to verify
 * @param {VerifyCallback} callback - execute callback after verification
 */
Verify = function(config, token, callback) {
    async.waterfall([
        function(next) {
            config.Adapter.findVerificationToken(token, function(err, user) {
                next(err, user);
            });
        },
        function(user, next) {
            var isExpired = config.Adapter.emailVerificationExpired(user);
            if (isExpired) {
                config.Adapter.doEmailVerification(user, function(err, user) {
                    next({
                        err: config.errmsg.token_expired,
                        user: user
                    });
                });
            } else {
                next(null, user);
            }
        },
        function(user, next) {
            config.Adapter.verifyEmailAddress(user, function(err) {
                next(err, user);
            });
        }
    ], function(err, user) {
        callback(err, user);
    });
};

/**
 * Handles verify response
 * @callback VerifyCallback
 * @param {String} err - error, if it exists
 * @param {Object} user - user that was verified
 */

module.exports = Verify;