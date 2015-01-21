/** @module authr-password-reset */
var async = require('async');


/**
 * Generate a password reset token and save it to the db
 * @param {Object} config - authr configuration object
 * @param {String} email - email address to look up
 * @param {_generateTokenCallback} callback - callback to run when finished
 */
var _generateToken = function(config, email, callback) {
    async.waterfall([
        function(next) {
            if (email) {
                next(null);
            } else {
                next(config.errmsg.un_and_pw_required);
            }
        },
        function(next) {
            config.Adapter.getUserByEmail(email, function(err, user) {
                if (user) {
                    next(null, user);
                } else {
                    next(config.errmsg.email_address_not_found);
                }
            });
        },
        function(user, next) {
            config.Adapter.generateToken(20, function(err, token) {
                next(err, user, token);
            });
        },
        function(user, token, next) {
            config.Adapter.savePWResetToken(user, token, function(err, user) {

                next(err, user);
            });
        }
    ], function(err, user) {
        callback(err, user);
    });
};

/**
 * Handles _generateToken response
 * @callback _generateTokenCallback
 * @param {String} err - error message, if it exists
 * @param {Object} user - user that the token was generated for
 */

/**
 * Generate a password reset token and save it to the db
 * @param {Object} config - authr configuration object
 * @param {String} token - token to verify
 * @param {_verifyTokenCallback} callback - callback to run when finished
 */
var _verifyToken = function(config, token, callback) {
    async.waterfall([
        function(next) {
            if (token) {
                next(null, token);
            } else {
                next(config.errmsg.token_not_found);
            }
        },
        function(token, next) {
            config.Adapter.findResetToken(token, function(err, user) {
                next(err, user);
            });
        },
        function(user, next) {
            var isExpired = config.Adapter.resetTokenExpired(user);
            if (isExpired) {
                next(config.errmsg.token_expired, user);
            } else {
                next(null, user);
            }
        }
    ], function(err, user) {
        callback(err, user);
    });
};

/**
 * Handles _verifyToken response
 * @callback _verifyTokenCallback
 * @param {String} err - error message, if it exists
 * @param {Object} user - user that the token was verified against
 */

/**
 * Generate a password reset token and save it to the db
 * @param {Object} config - authr configuration object
 * @param {String} token - object containing username to update and new password
 * @param {String} password - new password
 * @param {_resetPasswordCallback} callback - callback to run when finished
 */
var _resetPassword = function(config, token, password, callback) {
    async.waterfall([
        function(next) {
            if (!token) {
                next(config.errmsg.token_missing);
            }

            if (!password) {
                next(config.errmsg.un_and_pw_required);
            }
            login = {
                password: password
            };
            next(null, login);
        },
        function(login, next) {
            config.Adapter.findResetToken(token, function(err, user) {
                next(err, user, login);
            });
        },
        function(user, login, next) {
            var isExpired = config.Adapter.resetTokenExpired(user);
            if (isExpired) {
                next(config.errmsg.token_expired, user);
            } else {
                next(null, user, login);
            }
        },
        function(user, login, next) {
            config.Adapter.hashPassword(login, user, config.user.password, function(err, user) {
                next(err, user);
            });
        },
        function(user, next) {
            config.Adapter.resetPassword(user, function(err, user) {
                next(null, user);
            });
        }
    ], function(err, user) {
        callback(err, user);
    });
};

/**
 * Handles _resetPassword response
 * @callback _resetPasswordCallback
 * @param {String} err - error message, if it exists
 * @param {Object} user - user that was updated
 */

module.exports = {
    generateToken: _generateToken,
    verifyToken: _verifyToken,
    resetPassword: _resetPassword
};