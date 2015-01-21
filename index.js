/** @module authr */

var Signup = require('./lib/signup.js');
var Login = require('./lib/login.js');
var Verify = require('./lib/verify_email.js');
var Reset = require('./lib/reset_password.js');
var Delete = require('./lib/delete_account.js');
var Validate = require('./lib/validator.js');

/**
 * Represents a new Authr instance.
 * @class
 * @param {object} config - Configuration options for instance.
 */

function Authr(config) {

    // initialize config
    this.config = config || {};

    // Check to make sure defaults are not missing.
    this.db();
    this.security();
    this.user();
    this.errormsg();

    // create a new adapter
    this.getAdapter();
    var self = this;

    process.on('SIGINT', function() {
        self.config.Adapter.disconnect(function() {
            process.exit(0);
        });
    });

}

/**
 * Signup function exposed to user.
 * @param {Object} signup - User object to be persisted to database
 * @param {signUpCallback} callback - Run callback when finished if it exists
 * @example
 * // Returns the user object that was inserted into the database
 * var Authr = require('authr');
 * var authr = new Authr('./config.json');
 * var signup = {username: 'test@test.com', password:'test'}
 * authr.signUp(signup, function(err, user){
 *     console.log(user)
 * });
 */
Authr.prototype.signUp = function(signup, callback) {
    Signup(this.config, signup, function(err, user) {
        if (callback) {
            return callback(err, user);
        }
    });
};

/**
 * Function to handle signUp response
 * @callback signUpCallback
 * @param {String} err - error message, if it exists
 * @param {Object} user - user that was signed up
 */

Authr.prototype.validate = function(signup, callback) {
    Validate(this.config, signup, function(err, signup) {
        if (callback) {
            return callback(err, signup);
        }
    });
};

/**
 * Logs a user in
 * @param {Object} login - username and password to log in with
 * @return {loginCallback}
 * @example
 * // Returns the user object that was logged into
 * var Authr = require('authr');
 * var authr = new Authr('./config.json');
 * var login = {username: 'test@test.com', password:'test'}
 * authr.login(login, function(err, user){
 *     console.log(user)
 * });
 */
Authr.prototype.login = function(login, callback) {
    Login(this.config, login, function(err, user) {
        if (callback) {
            return callback(err, user);
        }
    });
};

/**
 * Function to handle login response
 * @callback loginCallback
 * @param {String} err - error message, if it exists
 * @param {Object} user - user that was logged in
 */

/**
 * Verifies a user email address.
 * @param {Object} token - token to verify
 * @param {verifyEmailCallback} callback - execute callback when function finishes
 * @example
 * // Returns the user object for the user that was verified
 * var Authr = require('authr');
 * var authr = new Authr('./config.json');
 * authr.verifyEmail(token_from_signup, function(err, user){
 *     console.log(user);
 * });
 */
Authr.prototype.verifyEmail = function(token, callback) {
    Verify(this.config, token, function(err, user) {
        if (callback) {
            return callback(err, user);
        }
    });
};

/**
 * Function to handle verifyEmail response
 * @callback verifyEmailCallback
 * @param {String} err - error message, if it exists
 * @param {Object} user - user that was verified
 */

/**
 * Generates a password reset token for a user
 * @param {String} email_address - email address to generate a reset token for
 * @return {createPasswordResetTokenCallback} callback - return a callback after the token is generated
 * @example
 * // Returns the user object for the user that requested the reset, including the token
 * var Authr = require('authr');
 * var authr = new Authr('./config.json');
 * authr.createPasswordResetToken('test@test.com', function(err, user){
 *     console.log(user);
 * });
 */
Authr.prototype.createPasswordResetToken = function(email_address, callback) {
    Reset.generateToken(this.config, email_address, function(err, user) {
        if (callback) {
            return callback(err, user);
        }
    });
};

/**
 * Function to handle createPasswordResetToken response
 * @callback createPasswordResetTokenCallback
 * @param {String} err - error message, if it exists
 * @param {Object} user - user object, including the newly created token
 */

/**
 * Verifies a password reset token
 * @param {String} token - token to verify
 * @return {verifyPasswordResetTokenCallback} callback - return a callback after the token is verified
 * @example
 * // Returns the user object that the token was verified against
 * var Authr = require('authr');
 * var authr = new Authr('./config.json');
 * authr.verifyPasswordResetToken(token_from_createPasswordResetToken, function(err, user){
 *     console.log(user);
 * });
 */
Authr.prototype.verifyPasswordResetToken = function(token, callback) {
    Reset.verifyToken(this.config, token, function(err, user) {
        if (callback) {
            return callback(err, user);
        }
    });
};

/**
 * Function to handle verifPasswordResetToken response
 * @callback verifyPasswordResetTokenCallback
 * @param {String} err - error message, if it exists
 * @param {Object} user - user that the token was verified against
 */

/**
 * Reset a user's password
 * @param {Object} login - object containing username and new password
 * @return {updatePasswordCallback} callback - return a callback after the token is verified
 * @example
 * // Returns the user that updated their password
 * var Authr = require('authr');
 * var authr = new Authr('./config.json');
 * var signup = {username:'test@test.com', passowrd:'brand_new_password'};
 * authr.updatePassword(login, function(err, user){
 *     console.log(user);
 * });
 */
Authr.prototype.updatePassword = function(token, password, callback) {
    Reset.resetPassword(this.config, token, password, function(err, user) {
        if (callback) {
            return callback(err, user);
        }
    });
};

/**
 * Function to handle updatePassword response
 * @callback updatePasswordCallback
 * @param {String} err - error message, if it exists
 * @param {Object} user - user that was reset
 */

/**
 * Delete account
 * @param {Object} login - username/password of user to delete
 * @return {deleteAccountCallback} callback - return a callback after account is deleted
 * @example
 * // Deletes a user and returns their account in case you need it for something
 * var Authr = require('authr');
 * var authr = new Authr('./config.json');
 * // require username and password again to verify account deletion
 * var login = {username: 'test@test.com', password:'test'};
 * authr.deleteAccount(login, function(err, user){
 *     console.log(user)
 * });
 */
Authr.prototype.deleteAccount = function(login, callback) {
    Delete(this.config, login, function(err, user) {
        if (callback) {
            return callback(err, user);
        }
    });
};

/**
 * Function to handle deleteAccount response
 * @callback deleteAccountCallback
 * @param {String} err - error message, if it exists
 * @param {Object} user - user that was signed deleted
 */

/**
 * Sets default database configuration - in-memory nedb. Does not set any mising options.
 * @private
 */
Authr.prototype.db = function() {
    if (!this.config.db) {
        this.config.db = {
            type: 'nedb'
        };
    }

};

/**
 * Sets default error message text
 * @private
 */
Authr.prototype.errormsg = function() {
    if (!this.config.errmsg) {
        this.config.errmsg = {
            username_taken: 'This username is taken Please choose another.',
            email_address_taken: 'This email address is already in use. Please try again.',
            token_not_found: 'This token does not exist. Please try again.',
            token_expired: 'This token has expired. A new one has been generated.',
            un_and_pw_required: 'Username and/or password are required',
            username_not_found: 'Your username and/or password is invalid. Please try again.',
            password_incorrect: 'Your username and/or password is invalid. Please try again.',
            account_locked: 'Too many failed attempts. This account will be locked for ##i## minutes.',
            email_address_not_verified: 'Your email address is not verified. Please click the link in the verification email to activate your account.',
            email_address_not_found: 'Could not find this email address. Please try again.'
        };
    } else {
        if (!this.config.errmsg.username_taken) {
            this.config.errmsg.username_taken = 'This username is taken. Please choose another';
        }
        if (!this.config.errmsg.token_not_found) {
            this.config.errmsg.token_not_found = 'This signup token does not exist. Please try again.';
        }
        if (!this.config.errmsg.token_expired) {
            this.config.errmsg.token_expired = 'This token has expired. A new one has been generated.';
        }

        if (!this.config.errmsg.un_and_pw_required) {
            this.config.errmsg.un_and_pw_required = 'A username and password are required to log in.';
        }

        if (!this.config.errmsg.username_not_found) {
            this.config.errmsg.username_not_found = 'Username not found. Please try again or sign up.';
        }
        if (!this.config.errmsg.password_incorrect) {
            this.config.errmsg.password_incorrect = 'Password incorrect. Your account will be locked after ##i## more failed attempts.';
        }
        if (!this.config.errmsg.account_locked) {
            this.config.errmsg.account_locked = 'Too many failed attempts. This account will be locked for ##i## minutes.';
        }
        if (!this.config.errmsg.email_address_not_verified) {
            this.config.errmsg.email_address_not_verified = 'Your email address is not verified. Please click the link in the verification email to activate your account.';
        }
        if (!this.config.errmsg.email_address_taken) {
            this.config.errmsg.email_address_taken = 'This email address is already in use. Please try again.';
        }
        if (!this.config.errmsg.email_address_not_found) {
            this.config.errmsg.email_address_not_found = 'Could not find this email address. Please try again.';
        }
    }

};

/**
 * Sets default user config if it is missing or checks for any missing options and sets defaults.
 * @private
 */
Authr.prototype.user = function() {
    if (!this.config.user) {
        this.config.user = {
            username: 'username',
            password: 'password',
            password_reset_token: 'password_reset_token',
            password_reset_token_expiration: 'password_reset_token_expires',
            account_locked: 'account_locked',
            account_locked_until: 'account_locked_until',
            account_failed_attempts: 'account_failed_attempts',
            account_last_failed_attempt: 'account_last_failed_attempt',
            email_address: 'username',
            email_verified: 'email_verified',
            email_verification_hash: 'email_verification_hash',
            email_verification_hash_expires: 'email_verification_expires'
        };
    } else {
        if (!this.config.user.username) {
            this.config.user.username = 'username';
        }
        if (!this.config.user.password) {
            this.config.user.password = 'password';
        }
        if (!this.config.user.password_reset_token) {
            this.config.user.password_reset_token = 'pasword_reset_token';
        }
        if (!this.config.user.password_reset_token_expiration) {
            this.config.user.password_reset_token_expiration = 'pasword_reset_token_expires';
        }

        if (!this.config.email_address) {
            this.config.email_address = 'username';
        }

        if (this.config.security.email_verification) {
            if (!this.config.user.email_verified) {
                this.config.user.email_verified = 'email_verified';
            }
            if (!this.config.user.email_verification_hash) {
                this.config.user.email_verification_hash = 'email_verification_hash';
            }

            if (!this.config.user.email_verification_hash_expires) {
                this.config.user.email_verification_hash_expires = 'email_verification_hash_expires';
            }
        }

        if (this.config.security.max_failed_login_attempts) {
            if (!this.config.user.account_locked) {
                this.config.account_locked = 'account_locked';
            }

            if (!this.config.user.account_locked_until) {
                this.config.user.account_locked_until = 'account_locked_until';
            }

            if (!this.config.user.account_failed_attempts) {
                this.config.user.account_failed_attempts = 'account_failed_attempts';
            }

        }
    }
};

/**
 * Sets default security config. Checks for a missing config and sets all defaults or checks for missing options and sets defaults for any missing options
 * @private
 */
Authr.prototype.security = function() {
    if (!this.config.security) {
        this.config.security = {
            hash_password: true,
            hash_salt_factor: 10,
            min_password_length: 6,
            max_password_length: 70,
            password_reset_token_expiration_hours: 1,
            max_failed_login_attempts: 10,
            reset_attempts_after_minutes: 5,
            lock_account_for_minutes: 30,
            email_verification: true,
            email_verification_expiration_hours: 12
        };
    } else {
        if (!this.config.security.min_password_length) {
            this.config.security.min_password_length = 6;
        }
        if (!this.config.security.max_password_length) {
            this.config.security.max_password_length = 70;
        }
        if (!this.config.security.hash_password) {
            this.config.security.hash_password = true;
        }
        if (!this.config.security.password_reset_token_expiration_hours) {
            this.config.security.password_reset_token_expiration_hours = 1;
        }
        if (!this.config.security.hash_salt_factor && this.config.security.hash_password === true) {
            this.config.security.hash_salt_factor = 10;
        }

        if (!this.config.security.email_reset_token_expiration_hours) {
            this.config.security.email_reset_token_expiration_hours = 1;
        }

        if (this.config.security.max_failed_login_attempts === null) {
            this.config.security.max_failed_login_attempts = 10;
        }

        if (this.config.security.max_failed_login_attempts && !this.config.security.reset_attempts_after_minutes) {
            this.config.security.reset_attempts_after_minutes = 5;
        }

        if (this.config.security.max_failed_login_attempts && !this.config.security.lock_account_for_minutes) {
            this.config.security.lock_account_for_minutes = 30;
        }

        if (this.config.security.email_verification === null) {
            this.config.security.email_verification = true;
        }

        if (this.config.security.email_verification && !this.config.security.email_verification_expiration_hours) {
            this.config.security.email_verification_expiration_hours = 12;
        }
    }

};

/**
 * Gets a new instance of the adapter depending on the db type specified in the config
 * @private
 */
Authr.prototype.getAdapter = function() {
    var self = this;
    var Adapter;
    switch (this.config.db.type) {
        case 'mongodb':
            Adapter = require('authr-mongo');
            break;
        case 'sqlite':
            Adapter = require('authr-sql');
            break;
        case 'mysql':
            Adapter = require('authr-sql');
            break;
        case 'mariadb':
            Adapter = require('authr-sql');
            break;
        case 'postgresql':
            Adapter = require('authr-sql');
            break;
        default:
            Adapter = require('authr-nedb');
            break;
    }
    self.config.Adapter = new Adapter(self.config);
    self.config.Adapter.connect(function(err) {});
};

module.exports = Authr;