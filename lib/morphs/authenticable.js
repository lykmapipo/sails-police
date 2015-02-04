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
                //if password doest match
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
                    var isConfirmed =
                        authenticable.confirmedAt && authenticable.confirmedAt !== null;

                    //TODO if confirmation token expiry update it and resent
                    if (!isConfirmed) {
                        next(new Error('Account not confirmed'));
                    } else {
                        next(null, authenticable);
                    }
                },
                //check if account is locked
                function(authenticable, next) {
                    var isLocked =
                        authenticable.lockedAt && authenticable.lockedAt !== null;

                    //TODO if unlock token expiry update it and resent
                    if (isLocked) {
                        next(new Error('Account is locked'));
                    } else {
                        next(null, authenticable);
                    }
                },
                //compare password
                function(authenticable, next) {
                    authenticable
                        .comparePassword(credentials.password, next);
                }
                //TODO update trackable information
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



/**
 * @description export singleton
 * @type {Object}
 */
exports = module.exports = new Authenticable();