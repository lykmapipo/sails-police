'use strict';
var async = require('async');
var path = require('path');
var moment = require('moment');

//police utilities
var Utils = require(path.join(__dirname, '..', 'utils'));

//police morphs helpers
var Helpers = require(path.join(__dirname, 'helpers'));


/**
 * @constructor
 * @author lykmapipo
 *
 * @description Recoverable takes care of resetting the user password and send reset instructions.
 *
 *              See {@link http://www.rubydoc.info/github/plataformatec/devise/master/Devise/Models/Recoverable|Recoverable}
 *
 * @private
 */
function Recoverable() {

};

/**
 * @function
 * @author lykmapipo
 *
 * @description mix recoverable to a given sails model
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model with recoverable applied to it.
 *
 * @public
 */
Recoverable.prototype.mixin = function(model) {
    //mix in recoverable attributes
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
 * @description extend valid sails model with recoverable attributes
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with recoverable
 *                          required attributes
 */
Recoverable.prototype._mixinAttributes = function(model) {

    //recoverable attributes
    var attributes = {
        recoveryToken: {
            type: 'string',
            defaultsTo: null,
            index: true
        },
        recoveryTokenExpiryAt: {
            type: 'datetime',
            defaultsTo: null
        },
        recoverySentAt: {
            type: 'datetime',
            defaultsTo: null
        },
        recoveredAt: {
            type: 'datetime',
            defaultsTo: null
        }
    };

    //mixin recoverable attributes
    Helpers.mixAttributes(model, attributes);
};

/**
 * @function
 * @author lykmapipo
 *
 * @description extend valid sails model with recoverable instance methods
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with recoverable
 *                          required instance methods.
 */
Recoverable.prototype._mixinInstanceMethods = function(model) {
    //bind  generate recovery token
    //as model instance method
    Helpers.mixAttributes(model, {
        generateRecoveryToken: this._generateRecoveryToken
    });

    //bind send recovery email
    //as model instance method
    Helpers.mixAttributes(model, {
        sendRecoveryEmail: this._sendRecoveryEmail
    });
};

/**
 * @function
 * @author lykmapipo
 *
 * @description extend valid sails model with recoverable static methods
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with recoverable
 *                          required static methods.
 */
Recoverable.prototype._mixinStaticMethods = function(model) {
    //bind account recover
    //as model static method
    Helpers.mixStaticMethod(model, 'recover', this._recover);
};

/**
 * @function
 * @author lykmapipo
 *
 * @description generate recovery token to be used to recover account
 *              This  function must be called within sails model instamce context
 *
 * @param {generateRecoveryToken ~callback} done callback that handles the response.
 * @private
 */
Recoverable.prototype._generateRecoveryToken = function(done) {
    //this refer to the model instance context
    var recoverable = this;

    //set recovery expiration date
    var recoveryTokenExpiryAt = Utils.addDays(3);

    //generate recovery token based
    //on recovery token expiry at
    var tokenizer =
        Utils.tokenizer(recoveryTokenExpiryAt.getTime().toString());

    var recoveryToken = tokenizer.encrypt(recoverable.email);

    //set recoveryToken
    recoverable.recoveryToken =
        recoveryToken;

    //set recovery token expiry date
    recoverable.recoveryTokenExpiryAt =
        recoveryTokenExpiryAt;

    //clear previous recovery details if any
    recoverable.recoveredAt = null;

    done(null, recoverable);
};

//documentation for `done` callback of `generateRecoveryToken`
/**
 * @description a callback to be called once generate recovery token is done
 * @callback generateRecoveryToken~callback
 * @param {Object} error any error encountered during generating recovery token
 * @param {Object} recoverable a recoverable instance with `recoveryToken`,
 *                             and `recoveryTokenExpiryAt` set-ed
 */


/**
 * @function
 * @author lykmapipo
 *
 * @description send recovery email to allow account to be recovered.
 *              This method must be called within model instance context
 *
 * @param {sendRecoveryEmail~callback} done callback that handles the response.
 * @private
 */
Recoverable.prototype._sendRecoveryEmail = function(next) {
    //this refer to model instance context
    var recoverable = this;

    //if already recovered back-off
    var isRecovered =
        recoverable.recoveredAt && recoverable.recoveredAt != null;

    if (isRecovered) {
        next(null, recoverable);
    } else {
        //transport registration recovery
        var police = require('sails-police');

        police
            .transport(
                police.NOTIFICATION_TYPES.PASSWORD_RECOVERY_CONFIRMATON,
                recoverable,
                function done() {
                    //update recovery send time
                    recoverable.recoverySentAt = new Date();
                    recoverable.save(next);
                });
    }
};

//documentation for `next` callback of `sendRecoveryEmail`
/**
 * @description a callback to be called once sending recovery email is done
 * @callback sendRecoveryEmail~callback
 * @param {Object} error any error encountered during sending crecovery email
 * @param {Object} crecoverable a crecoverable instance with `recoverySentAt`
 *                             updated and persisted
 */


/**
 * @function
 * @author lykmapipo
 *
 * @description recover account
 *              This method must be called within model static context
 *
 * @param  {String}   recoveryToken a valid crecovery token send during
 *                                      `sendRecoveryEmail`
 * @param  {String}   newPassword    new password to be used when recover account
 * @param {recover~callback} done callback that handles the response.
 * @private
 */
Recoverable.prototype._recover = function(recoveryToken, newPassword, done) {
    //this refer to model context
    var Recoverable = this;

    //TODO sanitize input
    //refactor

    async
        .waterfall(
            [
                //TODO check presence of token and password
                function(next) {
                    //find recoverable using recovery token
                    Recoverable
                        .findOneByRecoveryToken(recoveryToken)
                        .exec(function(error, recoverable) {
                            next(error, recoverable);
                        });
                },
                function(recoverable, next) {
                    //any recoverable found?
                    if (_.isUndefined(recoverable)) {
                        next(new Error('Invalid recovery token'));
                    } else {
                        next(null, recoverable);
                    }
                },
                function(recoverable, next) {
                    //check if recovery token expired
                    var isTokenExpired = !Utils.isAfter(new Date(), recoverable.recoveryTokenExpiryAt);

                    if (isTokenExpired) {
                        //if expired
                        next(new Error('Recovery token expired'));
                    } else {
                        //otherwise continue with token verification
                        next(null, recoverable);
                    }
                },
                function(recoverable, next) {
                    //verify recovery token
                    var value =
                        recoverable.recoveryTokenExpiryAt.getTime().toString();

                    var tokenizer =
                        Utils.tokenizer(value);

                    if (!tokenizer.match(recoveryToken, recoverable.email)) {
                        next(new Error('Invalid recovery token'));
                    } else {
                        //is valid token
                        next(null, recoverable);
                    }

                },
                function(recoverable, next) {
                    //set new password
                    recoverable.password = newPassword;
                    //encrypt password
                    recoverable.encryptPassword(next);
                },
                function(recoverable, next) {
                    //update recovery details
                    recoverable.recoveredAt = new Date();
                    recoverable.save(next);
                }
            ],
            function(error, recoverable) {
                if (error) {
                    done(error);
                } else {
                    done(null, recoverable);
                }
            });

};

//documentation for `done` callback of `recover`
/**
 * @description a callback to be called once recovery is done
 * @callback recover~callback
 * @param {Object} error any error encountered during recovering account
 * @param {Object} recoverable a recoverable instance with `recoveredAt`
 *                             updated and persisted
 */


/**
 * @description export singleton
 * @type {Object}
 */
exports = module.exports = new Recoverable();