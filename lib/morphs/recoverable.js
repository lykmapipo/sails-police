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

    this.bindModelRecover();
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

            callback(null, recoverable)


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


/**
 *@description Extend model with recover functionality
 */
Recoverable.prototype.bindModelRecover = function() {
    var self = this;

    function recover(recoveryToken, newPassword, callback) {
        //this refer to model context
        var Recoverable = this;

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
                        callback(error);
                    } else {
                        callback(null, recoverable);
                    }
                });

    };

    //model static recovery
    self.model.recover = recover;

};

module.exports = Recoverable;