'use strict';
var _ = require('lodash');
var path = require('path');
var moment = require('moment');
var Utils = require(path.join(__dirname, '..', 'utils'));

/**
 * @description Holds common settings for recovery and morph a
 *              model to be authentication recovery aware.
 * @param {Boolean} model a sails model to be morped as authentication recovery object
 * @public
 */
function Recoverable(model) {
    if (!model) {
        throw new Error('Unspecified model');
    }

    this.model = model;

    //make model recoverable
    this.initialize();

    //return model
    return this.model;
};

/**
 * @description initialize recoverable
 */
Recoverable.prototype.initialize = function() {
    //make model as recoverable
    this.model.recoverable = true;

    this.extendModelAttributes();

    this.bindModelGenerateRecoveryToken();

    this.bindModelSendRecovery();
};

/**
 * @description extend model with recoverable attributes
 */
Recoverable.prototype.extendModelAttributes = function() {
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

    //if model doesnt have attributes hash add it
    if (!this.model.attributes) {
        _.extend(this.model, {
            attributes: {}
        });
    }

    //extend model with recoverable attributes
    _.extend(this.model.attributes, attributes);

};

/**
 *@description Extend model with recovery token generate functionality
 */
Recoverable.prototype.bindModelGenerateRecoveryToken = function() {
    var self = this;

    function generateRecoveryToken(callback) {
            var recoverable = this;
            //set recovery expiration date
            var recoveryTokenExpiryAt = Utils.addDays(3);

            //generate recovery token based
            //on recovery token expiry at
            Utils
                .hash(
                    recoveryTokenExpiryAt.getTime().toString(),
                    function(error, recoveryToken) {
                        if (error) {
                            callback(error);
                        } else {
                            //set recoveryToken
                            recoverable.recoveryToken =
                                recoveryToken;

                            //set recovery token expiry date
                            recoverable.recoveryTokenExpiryAt =
                                recoveryTokenExpiryAt;

                            //clear previous recovery details if any
                            recoverable.recoveredAt = null;

                            callback(null, recoverable)
                        }
                    });

        }
        //bind instance generate recovery token method
    _.extend(self.model.attributes, {
        generateRecoveryToken: generateRecoveryToken
    });
};

/**
 *@description Extend model with send recovery token functionality
 */
Recoverable.prototype.bindModelSendRecovery = function() {
    var self = this;

    function sendRecovery(callback) {
        //this refer to model instance context
        var recoverable = this;

        //if already recovered back-off
        var isRecovered =
            recoverable.recoveredAt && recoverable.recoveredAt != null;

        if (isRecovered) {
            callback(null, recoverable);
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
                        recoverable.save(callback);
                    });
        }
    };

    //bind instance send recovery method
    _.extend(self.model.attributes, {
        sendRecovery: sendRecovery
    });

};

module.exports = Recoverable;