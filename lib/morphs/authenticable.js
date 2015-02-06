'use strict';
var async = require('async');
var path = require('path');
var moment = require('moment');
var validator = require('validator');
var bcrypt = require('bcryptjs');


//police utilities
var Utils = require(path.join(__dirname, '..', 'utils'));

//police morphs helpers
var Helpers = require(path.join(__dirname, 'helpers'));
var Confirmable = require(path.join(__dirname, 'confirmable'));
var Lockable = require(path.join(__dirname, 'lockable'));


/**
 * @constructor
 * @author lykmapipo
 *
 * @description Holds common settings for authentication.
 *              See {@link http://www.rubydoc.info/github/plataformatec/devise/master/Devise/Models/Authenticatable|Authenticable}
 *
 * @private
 */
function Authenticable() {

};

/**
 * @function
 * @author lykmapipo
 *
 * @description mix authenticable to a given sails model
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model with authenticable applied to it.
 *
 * @public
 */
Authenticable.prototype.mixin = function(model) {
    //mix in authenticable attributes
    this._mixinAttributes(model);

    //mix instance methods
    this._mixinInstanceMethods(model);

    //mix static methods
    this._mixinStaticMethods(model);

    //return model
    return model;
};


/**
 * @function
 * @author lykmapipo
 *
 * @description extend valid sails model with authenticable attributes
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with authenticable
 *                          required attributes
 */
Authenticable.prototype._mixinAttributes = function(model) {

    //authenticable attributes
    var attributes = {
        email: {
            type: 'email',
            unique: true,
            required: true
        },
        username: {
            type: 'string',
            required: true,
        },
        password: {
            type: 'string',
            required: true,
            protected: true
        }
    };

    //mixin authenticable attributes
    Helpers.mixAttributes(model, attributes);
};

/**
 * @function
 * @author lykmapipo
 *
 * @description extend valid sails model with authenticable instance methods
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with authenticable
 *                          required instance methods.
 */
Authenticable.prototype._mixinInstanceMethods = function(model) {
    //bind  encrypt password
    //as model instance method
    Helpers.mixAttributes(model, {
        encryptPassword: this._encryptPassword
    });

    //bind  encrypt password
    //as model instance method
    Helpers.mixAttributes(model, {
        comparePassword: this._comparePassword
    });

    //bind  change password
    //as model instance method
    Helpers.mixAttributes(model, {
        changePassword: this._changePassword
    });
};

/**
 * @function
 * @author lykmapipo
 *
 * @description extend valid sails model with authenticable static methods
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with authenticable
 *                          required static methods.
 */
Authenticable.prototype._mixinStaticMethods = function(model) {
    //bind account authenticate
    //as model static method
    Helpers.mixStaticMethod(model, 'authenticate', this._authenticate);
};

/**
 * @dscription hash authenticable passpword and set it to passowrd attribute.
 *             This method must be called within model instance context
 *
 * @param {encryptPassword~callback} done callback that handles the response.
 * @private
 */
Authenticable.prototype._encryptPassword = function(done) {
    //this refer to the model insatnce context
    var authenticable = this;

    Utils
        .hash(authenticable.password, function(error, hash) {
            if (error) {
                done(error);
            } else {
                authenticable.password = hash;
                done(null, authenticable);
            }
        });
};

//documentation for `done` callback of `gencryptPassword`
/**
 * @description a callback to be called when encrypt password is done
 * @callback encryptPassword~callback
 * @param {Object} error any error encountered during encrypting password
 * @param {Object} authenticable a authenticable instance with `password` set-ed
 */


/**
 * @function
 * @author lykmapipo
 *
 * @dscription compare the given password to the currect encrypted password
 *             This method must be called within model instance context
 *
 * @param {comparePassword~callback} done callback that handles the response.
 * @private
 */
Authenticable.prototype._comparePassword = function(password, done) {
    //this refer to the model instance context
    var authenticable = this;

    bcrypt
        .compare(password, this.password, function(error, result) {
            if (error) {
                //if there is any error during comparison
                done(error);
            } else if (!result) {
                //if password does not match
                done(new Error('Incorrect email or password')); //Password mismath
            } else {
                //we ok 
                done(null, authenticable);

            }
        });
};

//documentation for `done` callback of `comparePassword`
/**
 * @description a callback to be called when compare password is done
 * @callback comparePassword~callback
 * @param {Object} error any error encountered during compare password
 * @param {Object} authenticable a authenticable instance if password
 *                               match otherwise corresponding error
 */


/**
 * @function
 * @author lykmapipo
 *
 * @description change the existing instance password to the new one
 *              This method must be called within model instance context
 *
 * @param  {String}   newPassword      new instance password to be set-ed
 * @param {changePassword~callback} done callback that handles the response.
 * @private
 */
Authenticable.prototype._changePassword = function(newPassword, done) {
    var authenticable = this;

    async
        .waterfall(
            [
                function(next) {
                    //is new password provided?
                    if (!newPassword) {
                        next(new Error('No password provided'));
                    } else {
                        next(null, newPassword);
                    }
                },
                function(newPassword, next) {
                    //set new password
                    authenticable.password = newPassword;
                    //encrypt new password
                    authenticable.encryptPassword(next);
                }
            ],
            function(error, authenticable) {
                if (error) {
                    done(error);
                } else {
                    done(null, authenticable);
                }
            });
};

//documentation for `done` callback of `changePassword`
/**
 * @description a callback to be called when change password is done
 * @callback changePassword~callback
 * @param {Object} error any error encountered during change password
 * @param {Object} authenticable a authenticable instance if `password`
 *                               changed successfully
 */



/**
 * @function
 * @author lykmapipo
 *
 * @description authenticate supplied account credentials.
 *              This method must be called within model static context
 *
 * @param  {Object}   credentials account credentials
 * @param {authenticate~callback} done callback that handles the response.
 * @private
 */
Authenticable.prototype._authenticate = function(credentials, done) {
    //this refer to the model static
    var Authenticable = this;

    //TODO sanitize input
    //refactoring

    async
        .waterfall(
            [
                //check if credentials provided
                function(next) {

                    var isValidCredentials = _.isPlainObject(credentials) &&
                        (credentials.email && credentials.password);

                    isValidCredentials =
                        isValidCredentials && validator.isEmail(credentials.email);

                    if (isValidCredentials) {
                        next();
                    } else {
                        next(new Error('Incorrect email or password'));
                    }
                },
                //find authenticable by emails
                //TODO get only registered account
                function(next) {
                    Authenticable
                        .findOneByEmail(credentials.email)
                        .exec(function(error, authenticable) {
                            next(error, authenticable);
                        });
                },
                //check if there is authenticable found
                function(authenticable, next) {
                    if (_.isUndefined(authenticable) ||
                        _.isNull(authenticable)) {
                        next(new Error('Incorrect email or password'));
                    } else {
                        next(null, authenticable);
                    }
                },
                //check if is confirmed
                function(authenticable, next) {
                    Confirmable
                        .checkConfirmation(authenticable, next);
                },
                //check if account is locked
                function(authenticable, next) {
                    Lockable
                        .checkLock(authenticable, next);
                },
                //compare password
                function(authenticable, next) {
                    exports
                        .checkPassword(credentials.password, authenticable, next);
                    //TODO if not same update failed attempt
                }
            ],
            function(error, authenticable) {
                if (error) {
                    done(error);
                } else {
                    done(null, authenticable);
                }
            });

};

//documentation for `done` callback of `authenticate`
/**
 * @description a callback to be called when authenticate is done
 * @callback authenticate~callback
 * @param {Object} error any error encountered during authenticating account credentials
 * @param {Object} authenticable a authenticable instance if provided
 *                               credentials pass authenticate flow
 *                               otherwise corresponding error
 */



Authenticable.prototype.checkPassword = function(password, authentication, done) {
    //this context is of Authenticable

    //TODO make use of async
    //by passing errors as args
    authentication
        .comparePassword(password, function(error, authenticable) {
            //password does not match
            if (error) {
                var passwordError = error;

                //update failed attempts
                authentication.failedAttempts =
                    authentication.failedAttempts + 1;

                //failed attempts exceed five
                if (authentication.failedAttempts >= 5) {
                    //lock account
                    authentication
                        .lock(function(error, authenticable) {
                            if (error) {
                                done(error);
                            } else {
                                done(new Error('Account locked. Check your email to unlock'));
                            }
                        });

                } else {
                    //failed attempts are less than five
                    //return password doesnt match error
                    authentication
                        .save(function(error, authenticable) {
                            if (error) {
                                done(error);
                            } else {
                                done(passwordError);
                            }
                        });
                }
            }
            //password match
            else {
                //clear previous failed attempts
                authenticable.failedAttempts = 0;
                authenticable.save(done);
            }
        });
};


/**
 * @description export singleton
 * @type {Object}
 */
exports = module.exports = new Authenticable();