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
 * @description Confirmable is responsible to verify if an account is
 *              already confirmed to sign in, and to send emails with
 *              confirmation instructions. Confirmation instructions are
 *              sent to the user email after creating an account and
 *              when manually requested by a new confirmation instruction request.
 *
 *              See {@link http://www.rubydoc.info/github/plataformatec/devise/master/Devise/Models/Confirmable|Confirmable}
 *
 * @private
 */
function Confirmable() {

};

/**
 * @function
 * @author lykmapipo
 *
 * @description mix confirmable to a given sails model
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model with confirmable applied to it.
 *
 * @public
 */
Confirmable.prototype.mixin = function(model) {
    //mix in confirmable attributes
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
 * @description extend valid sails model with confirmable attributes
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with confirmable
 *                          required attributes
 */
Confirmable.prototype._mixinAttributes = function(model) {

    //confirmable attributes
    var attributes = {
        confirmationToken: {
            type: 'string',
            defaultsTo: null,
            index: true
        },
        confirmationTokenExpiryAt: {
            type: 'datetime',
            defaultsTo: null
        },
        confirmedAt: {
            type: 'datetime',
            defaultsTo: null
        },
        confirmationSentAt: {
            type: 'datetime',
            defaultsTo: null
        }
    };

    //mixin confirmable attributes
    Helpers.mixAttributes(model, attributes);
};

/**
 * @function
 * @author lykmapipo
 *
 * @description extend valid sails model with confirmable instance methods
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with confirmable
 *                          required instance methods.
 */
Confirmable.prototype._mixinInstanceMethods = function(model) {
    //bind  generate confirmation token
    //as model instance method
    Helpers.mixAttributes(model, {
        generateConfirmationToken: this._generateConfirmationToken
    });

    //bind send confirmation
    //as model instance method
    Helpers.mixAttributes(model, {
        sendConfirmationEmail: this._sendConfirmationEmail
    });
};

/**
 * @function
 * @author lykmapipo
 *
 * @description extend valid sails model with confirmable static methods
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with confirmable
 *                          required static methods.
 */
Confirmable.prototype._mixinStaticMethods = function(model) {
    //bind account confirmation
    //as model static method
    Helpers.mixStaticMethod(model, 'confirm', this._confirm);
};

/**
 * @function
 * @author lykmapipo
 *
 * @description generate confirmation token to be used to confirm account creation.
 *              This  function must be called within sails model instamce context
 *
 * @param {generateConfirmationToken~callback} done callback that handles the response.
 * @private
 */
Confirmable.prototype._generateConfirmationToken = function(done) {
    //this context is of sails model instance
    var confirmable = this;

    //set confirmation expiration date
    var expiryAt = moment().add(3, 'days');
    var confirmationTokenExpiryAt = expiryAt.toDate();

    //generate confirmation token based
    //on confirmation token expiry at
    var tokenizer =
        Utils.tokenizer(confirmationTokenExpiryAt.getTime().toString());

    var confirmationToken = tokenizer.encrypt(confirmable.email);

    //set confirmationToken
    confirmable.confirmationToken =
        confirmationToken;

    //set confirmation token expiry date
    confirmable.confirmationTokenExpiryAt =
        confirmationTokenExpiryAt;

    //clear previous confirm details if any
    confirmable.confirmedAt = null;

    //return
    done(null, confirmable);
};

//documentation for `done` callback of `generateConfirmationToken`
/**
 * @description a callback to be called once generate confirmation token is done
 * @callback generateConfirmationToken~callback
 * @param {Object} error any error encountered during generating confirmation token
 * @param {Object} confirmable a confirmable instance with `confirmationToken`,
 *                             and `confirmationTokenExpiryAt` set-ed
 */


/**
 * @description send email confirmation to allow account to be confirmed.
 *              This method must be called within model instance context
 *
 * @param {sendConfirmation~callback} done callback that handles the response.
 * @private
 */
Confirmable.prototype._sendConfirmationEmail = function(next) {
    //this refer to model instance context
    var confirmable = this;

    //if already confirmed back-off
    var isConfirmed =
        (confirmable.confirmedAt && confirmable.confirmedAt != null);

    if (isConfirmed) {
        next(null, confirmable);
    } else {
        //transport registration confirmation
        var police = require('sails-police');

        police
            .transport(
                police.NOTIFICATION_TYPES.REGISTRATION_CONFIRMATON,
                confirmable,
                function done() {
                    //update confirmation send time
                    confirmable.confirmationSentAt = new Date();
                    confirmable.save(next);
                });
    }
};

//documentation for `next` callback of `sendConfirmation`
/**
 * @description a callback to be called once compose confirmation is done
 * @callback sendConfirmation~callback
 * @param {Object} error any error encountered during sending confirmation email
 * @param {Object} confirmable a confirmable instance with `confirmationSentAt`
 *                             updated and persisted
 */


/**
 * @description confirm account creation
 * @param  {String}   confirmationToken a valid confirmation token send during
 *                                      `sendConfirmationEmail`
 *                                       This method must be called within model static context
 *
 * @param {confirm~callback} done callback that handles the response.
 * @private
 */
Confirmable.prototype._confirm = function confirm(confirmationToken, done) {
    //this refer to model static context
    var Confirmable = this;

    //TODO
    //sanitize confirmationToken
    //refactoring

    async
        .waterfall(
            [
                function(next) {
                    //find confirmable using confirmation token
                    Confirmable
                        .findOneByConfirmationToken(confirmationToken)
                        .exec(function(error, confirmable) {
                            next(error, confirmable);
                        });
                },
                function(confirmable, next) {
                    //any confirmable found?
                    if (_.isUndefined(confirmable)) {
                        next(new Error('Invalid confirmation token'));
                    } else {
                        next(null, confirmable);
                    }
                },
                function(confirmable, next) {
                    //check if confirmation token expired
                    var isTokenExpiry =
                        (!Utils.isAfter(new Date(), confirmable.confirmationTokenExpiryAt));

                    if (isTokenExpiry) {
                        //if expired
                        next(new Error('Confirmation token expired'));
                    } else {
                        //otherwise continue with token verification
                        next(null, confirmable);
                    }
                },
                function(confirmable, next) {
                    //verify confirmation token
                    var value =
                        confirmable.confirmationTokenExpiryAt.getTime().toString();

                    var tokenizer =
                        Utils.tokenizer(value);

                    if (!tokenizer.match(confirmationToken, confirmable.email)) {
                        next(new Error('Invalid confirmation token'));
                    } else {
                        //is valid token
                        next(null, confirmable);
                    }
                },
                function(confirmable, next) {
                    //update confirmation details
                    confirmable.confirmedAt = new Date();
                    confirmable.save(next);
                }
            ],
            function(error, confirmable) {
                if (error) {
                    done(error);
                } else {
                    done(null, confirmable);
                }
            });

};

//documentation for `done` callback of `confirm`
/**
 * @description a callback to be called once confirmation is done
 * @callback confirm~callback
 * @param {Object} error any error encountered during account confirmation
 * @param {Object} confirmable a confirmable instance with `confirmedAt`
 *                             updated and persisted
 */


/**
 * @description Compose confirmable confirmation
 *              by generate and send confirmation email details
 * @param {Object} confirmable valid sails model morphed with sails-police
 * @param {composeConfirmation~callback} done callback that handles the response.
 * @public
 */
Confirmable.prototype.composeConfirmation = function(confirmable, done) {
    //this context is of Confirmable

    async
        .waterfall(
            [
                function generateConfirmationToken(next) {
                    confirmable
                        .generateConfirmationToken(next);
                },
                function sendConfirmationEmail(confirmable, next) {
                    confirmable
                        .sendConfirmation(next);
                }
            ],
            function(error, confirmable) {
                done(error, confirmable);
            });
};

//documentation for `done` callback of `composeConfirmation`
/**
 * @description a callback to be called once compose confirmation is done
 * @callback composeConfirmation~callback
 * @param {Object} error any error encountered during the process of composing
 *                       confirmation
 * @param {Object} confirmable a confirmable instance with `confirmationToken`,
 *                             `confirmationTokenExpiryAt` and `confirmationSentAt`
 *                             updated and persisted
 */


/**
 * @description Check if confirmable is confirmed by using the below flow:
 *              1. If is confirmed continue.
 *              2. If not confirmed and confirmation token not expired throw `Account not confirmed`
 *              3. If not confirmed and confirmation token expired
 *                 `composeConfirmation` and throw
 *                 `Confirmation token expired. Check your email for confirmation`
 *
 * @param {Object} confirmable valid sails model morphed with sails-police
 * @callback checkConfirmation~callback done callback that handle response
 * @public
 */
Confirmable.prototype.checkConfirmation = function(confirmable, done) {
    //this context is of Confirmable
    var self = this;

    //check if already confirmed
    var isConfirmed =
        (confirmable.confirmedAt && confirmable.confirmedAt !== null);

    //check if confirmation token expired
    var isTokenExpired =
        (!Utils.isAfter(new Date(), confirmable.confirmationTokenExpiryAt));

    //is already confirmed
    if (!isConfirmed && !isTokenExpired) {
        done(new Error('Account not confirmed'));

    }
    //is not confirmed and
    //confirmation token is expired 
    else if (!isConfirmed && isTokenExpired) {
        //compose confirmation
        self
            .composeConfirmation(confirmable, function(error, confirmable) {
                //is there any error during
                //compose new confirmation?
                if (error) {
                    done(error);
                }
                //new confirmation token is
                // and send successfully
                else {
                    done(new Error('Confirmation token expired. Check your email for confirmation.'));
                }
            });
    }
    //is confirmed 
    else {
        done(null, confirmable);
    }
};

//documentation for `done` callback of `checkConfirmation`
/**
 * @description a callback to be called once check confirmation is done
 * @callback checkConfirmation~callback
 * @param {Object} error any error encountered during the process of checking
 *                       confirmation
 * @param {Object} confirmable a confirmable instance with `confirmationToken`,
 *                             `confirmationTokenExpiryAt` and `confirmationSentAt`
 *                             updated and persisted if confirmable was not confirmed
 *                             and confirmation token was expired. Otherwise untouched
 *                             confirmable instane.
 */


/**
 * @description export singleton
 * @type {Object}
 */
exports = module.exports = new Confirmable();