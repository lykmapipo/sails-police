/** @module police */
var Signup = require('./lib/signup.js');
var Login = require('./lib/login.js');
var Verify = require('./lib/verify_email.js');
var Reset = require('./lib/reset_password.js');
var Delete = require('./lib/delete_account.js');
var Validate = require('./lib/validator.js');

//external dependencies
var _ = require('lodash');
var passport = require('passport');

//morphs
var Authenticable = require('./lib/morphs/authenticable.js');
var Confirmable = require('./lib/morphs/confirmable.js');
var Lockable = require('./lib/morphs/lockable.js');
var Recoverable = require('./lib/morphs/recoverable.js');
var Registerable = require('./lib/morphs/registerable.js');
var Trackable = require('./lib/morphs/trackable.js');
var Passport = require('./lib/http/passport.js');

/**
 * Represents a new Police instance.
 * @class
 * @param {object} config - Configuration options for instance.
 */

function Police() {
    //notification type constant
    this.NOTIFICATION_TYPES = {
        REGISTRATION_CONFIRMATON: 'Registration confirmation',
        REGISTRATION_CONFIRMATON_RESEND: 'Registration confirmation resent',
        UNLOCK_CONFIRMATON: 'Unlock confirmation',
        UNLOCK_CONFIRMATON_RESEND: 'Unlock confirmation resent',
        PASSWORD_RECOVERY_CONFIRMATON: 'Password recovery confirmation',
        PASSWORD_RECOVERY_CONFIRMATON_RESEND: 'Password recovery confirmation resend'
    };

    //add default console notification transport
    this.transport = function(type, authenticable, done) {
        done();
    };

};

/**
 * @descriptio Mixin whole of police morphs into the given model
 * @param  {Object} model a sails model to mix in police morphs
 * @return {Object}       a sails model mixed with police morphs
 */
Police.prototype.model = {
    /**
     * @description mixin all sails-police morps into a model and extend it
     * @param  {Object} model valid sails model to be mixed with sails-police morphs
     * @return {Object}       valid sails model extended with sails-police morphs
     */
    mixin: function(model) {
        //mixin authenticable
        model = new Authenticable(model);

        //mixin confrimable
        model = new Confirmable(model);

        //mixin lockable
        model = new Lockable(model);

        //mixin recoverable
        model = new Recoverable(model);

        //mixin registerable
        model = new Registerable(model);

        //mixin trackble
        model = new Trackable(model);

        return model;
    }
};

/**
 * @description Lazy evaluate User model used by sails-police
 * @return {Object} current User model sails-police is using
 */
Police.prototype.getUser = function() {
    //return default user model
    if (!this.User) {
        this.User = User || sails.models.user;
    }
    return this.User;
};

/**
 * @description Set transport to use when send notifications
 * @param {Function} transport a function that implemented custom send notification
 */
Police.prototype.setTransport = function(transport) {
    //we currently support functional transport
    if (!_.isFunction(transport)) {
        throw new Error('Unsupported transport instance type')
    }
    this.transport = transport;
};

Police.prototype.setUser = function(User) {
    this.User = User;
};

//initialize passport
Police.prototype.initialize = function() {
    //initialize police passports
    new Passport();

    //return passportjs initialize
    //so that it can be added to sails middlewares
    return passport.initialize();
}

//initialize passport session
Police.prototype.session = function() {
    return passport.session();
}

Police.prototype.policies = {
    isAuthenticated: function isAuthenticated(request, response, next) {
        var loginRoute = '/signin';

        if (request.isAuthenticated()) {
            next();
        } else {
            response.redirect(loginRoute);
        }
    },

    mixin: function(policies) {
        return _.extend(policies, {
            'AuthController': {
                getSignin: true,
                postSignin: true,
                getSignup: true,
                postSignup: true,
                getConfirm: true,
                getForgot: true,
                postForgot: true,
                getRecover: true,
                postRecover: true,
                // deleteSignout: true,
                // postForgotPassword: true,
                // getForgotPasswordToken: true,
                // postForgotPasswordToken: true,
                // getResendVerification: true,
                // postResendVerification: true,
            }
        });
    }
};


Police.prototype.routes = {
    mixin: function(routes) {
        return _.extend(routes, {
            'get /signin': 'AuthController.getSignin',
            'post /signin': 'AuthController.postSignin',
            'get /signout': 'AuthController.deleteSignout', //TODO make use of DELETE
            'get /signup': 'AuthController.getSignup',
            'post /signup': 'AuthController.postSignup',
            'get /confirm/:token': 'AuthController.getConfirm', //TODO make use of PUT
            // 'post /resend_verification': 'AuthController.getResendVerification',
            // 'get /verification/:token': 'AuthController.getVerification',
            // 'get /delete_account': 'AuthController.getDelete',
            // 'post /delete_account': 'AuthController.postDelete',
            'get /forgot': 'AuthController.getForgot',
            'post /forgot': 'AuthController.postForgot',
            'get /recover/:token': 'AuthController.getRecover',
            'post /recover': 'AuthController.postRecover',
            // 'get /forgot_password/:token': 'AuthController.getForgotPasswordToken',
            // 'post /forgot_password/:token': 'AuthController.postForgotPasswordToken'});
        });
    }
};

/**
 * @description expose police middlewares populator
 * @type {Object}
 */
Police.prototype.middlewares = {
    /**
     * @description mixin police middlewares into sails middlewares
     * @param  {Object} middlewares sails js middlewares
     * @return {Object}             sailsjs middlewares extended with police middlewares
     */
    mixin: function(middlewares) {
        //remember current sails http config object
        var previousMiddlewares = middlewares;

        //remember current sails http middlewares
        var previousOrder = middlewares.middleware.order;

        //grab the current index of the sails router middleware
        //from sails middleware order
        var indexOfRouter = previousOrder.indexOf('router');

        //patching sails middleware and
        //adding police middlewares
        middlewares.middleware = _.extend(previousMiddlewares.middleware, {
            //police middleware to inject locals
            //which will store errors, warnings and success messages
            //they are heavily used in default views if police
            //to constitute messages
            policeLocals: function(request, response, next) {
                response.locals.error = null;
                response.locals.warning = null;
                response.locals.success = null;
                return next();
            },

            //police middleare to initialize passport police
            //and passportjs
            policeInit: exports.initialize(),

            //police middleware to inialize
            //passportjs session
            policeSession: exports.session()
        });

        //patching sails middleware order and add
        //police middlewares before router in the middleware order
        previousOrder.splice(indexOfRouter, 0, 'policeLocals', 'policeInit', 'policeSession');
        middlewares.middleware.order = previousOrder;

        //return patched sails http config object
        return middlewares;
    }
};

/**
 * Signup function exposed to user.
 * @param {Object} signup - User object to be persisted to database
 * @param {signUpCallback} callback - Run callback when finished if it exists
 * @example
 * // Returns the user object that was inserted into the database
 * var Police = require('police');
 * var police = new Police('./config.json');
 * var signup = {username: 'test@test.com', password:'test'}
 * police.signUp(signup, function(err, user){
 *     console.log(user)
 * });
 */
Police.prototype.signUp = function(signup, callback) {
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

Police.prototype.validate = function(signup, callback) {
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
 * var Police = require('police');
 * var police = new Police('./config.json');
 * var login = {username: 'test@test.com', password:'test'}
 * police.login(login, function(err, user){
 *     console.log(user)
 * });
 */
Police.prototype.login = function(login, callback) {
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
 * var Police = require('police');
 * var police = new Police('./config.json');
 * police.verifyEmail(token_from_signup, function(err, user){
 *     console.log(user);
 * });
 */
Police.prototype.verifyEmail = function(token, callback) {
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
 * var Police = require('police');
 * var police = new Police('./config.json');
 * police.createPasswordResetToken('test@test.com', function(err, user){
 *     console.log(user);
 * });
 */
Police.prototype.createPasswordResetToken = function(email_address, callback) {
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
 * var Police = require('police');
 * var police = new Police('./config.json');
 * police.verifyPasswordResetToken(token_from_createPasswordResetToken, function(err, user){
 *     console.log(user);
 * });
 */
Police.prototype.verifyPasswordResetToken = function(token, callback) {
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
 * var Police = require('police');
 * var police = new Police('./config.json');
 * var signup = {username:'test@test.com', passowrd:'brand_new_password'};
 * police.updatePassword(login, function(err, user){
 *     console.log(user);
 * });
 */
Police.prototype.updatePassword = function(token, password, callback) {
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
 * var Police = require('police');
 * var police = new Police('./config.json');
 * // require username and password again to verify account deletion
 * var login = {username: 'test@test.com', password:'test'};
 * police.deleteAccount(login, function(err, user){
 *     console.log(user)
 * });
 */
Police.prototype.deleteAccount = function(login, callback) {
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
Police.prototype.db = function() {
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
Police.prototype.errormsg = function() {
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
Police.prototype.user = function() {
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
Police.prototype.security = function() {
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
Police.prototype.getAdapter = function() {
    var self = this;
    var Adapter;
    switch (this.config.db.type) {
        case 'mongodb':
            Adapter = require('police-mongo');
            break;
        case 'sqlite':
            Adapter = require('police-sql');
            break;
        case 'mysql':
            Adapter = require('police-sql');
            break;
        case 'mariadb':
            Adapter = require('police-sql');
            break;
        case 'postgresql':
            Adapter = require('police-sql');
            break;
        default:
            Adapter = require('police-nedb');
            break;
    }
    self.config.Adapter = new Adapter(self.config);
    self.config.Adapter.connect(function(err) {});
};

/**
 * Export default singleton.
 *
 * @api public
 */
exports = module.exports = new Police();