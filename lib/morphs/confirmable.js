'use strict';
var async = require('async');
var path = require('path');

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
 */
function Confirmable() {

};

/**
 * @description expose confirmable mixins to be used by police
 * @type {Object}
 */
Confirmable.prototype.mixin = {
    /**
     * @description extend valid sails model with confrimable attributes
     * @param  {Object} model a valid sails model definition
     * @return {Object}       a sails model extended with confrimable
     *                          required attributes
     */
    attributes: function(model) {
    	
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

        //mixin confrimable attributes
        Helpers.mixAttributes(model, attributes);
    }
};

/**
 * @description Compose confirmable confirmation
 *              by generate and send confirmation email details
 * @param {Object} confirmable valid sails model morphed with sails-police
 * @param {composeConfirmation~callback} done callback that handles the response.
 */
Confirmable.prototype.composeConfirmation = function(confirmable, done) {
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
 * @param {Object} confrimable a confirmable instance with `confirmationToken`,
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
 * @param {Object} confirmable valid sails model morphed with sails-police
 * @callback checkConfirmation~callback done callback that handle response
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
    //confrimation token is expired 
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
 * @param {Object} confrimable a confirmable instance with `confirmationToken`,
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