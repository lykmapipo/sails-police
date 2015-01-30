'use strict';
var _ = require('lodash');
var path = require('path');
var moment = require('moment');
var Utils = require(path.join(__dirname, '..', 'utils'));
var async = require('async');

/**
 * @description Holds common settings for confirmable and morph a
 *              model to be confirmation aware.
 * @param {Boolean} model a sails model to be morped as confirmable object
 * @public
 */
function Confirmable(model) {
    if (!model) {
        throw new Error('Unspecified model');
    }

    this.model = model;

    //make model confirmable
    this.initialize();

    //return model
    return this.model;
};

/**
 * @description initialize confirmable
 */
Confirmable.prototype.initialize = function() {
    //mark model as confirmable
    this.model.confirmable = true;

    this.extendModelAttributes();

    this.bindModelGenerateConfirmationToken();

    this.bindModelSendConfirmation();

    this.bindModelConfirmation();
};

/**
 * @description extend model with confirmable attributes
 */
Confirmable.prototype.extendModelAttributes = function() {
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

    //if model doesnt have attributes hash add it
    if (!this.model.attributes) {
        _.extend(this.model, {
            attributes: {}
        });
    }

    //extend model with confirmable attributes
    _.extend(this.model.attributes, attributes);

};

/**
 *@description Extend model with confirmation token generate functionality
 */
Confirmable.prototype.bindModelGenerateConfirmationToken = function() {
    var self = this;

    function generateConfirmationToken(callback) {
        var confirmable = this;
        //set confirmation expiration date
        var expiryAt = moment().add(3, 'days');
        var confirmationTokenExpiryAt = expiryAt.toDate();

        //generate confirmation token based
        //on confirmation token expiry at
        Utils
            .hash(
                confirmationTokenExpiryAt.getTime().toString(),
                function(error, confirmationToken) {
                    if (error) {
                        callback(error);
                    } else {
                        //set confirmationToken
                        confirmable.confirmationToken =
                            confirmationToken;

                        //set confirmation token expiry date
                        confirmable.confirmationTokenExpiryAt =
                            confirmationTokenExpiryAt;

                        //clear previous confirm details if any
                        confirmable.confirmedAt = null;

                        callback(null, confirmable)
                    }
                });

    };

    //bind instance comparePassword method
    _.extend(self.model.attributes, {
        generateConfirmationToken: generateConfirmationToken
    });

};

/**
 *@description Extend model with send confirmation token functionality
 */
Confirmable.prototype.bindModelSendConfirmation = function() {
    var self = this;

    function sendConfirmation(callback) {
        //this refer to model instance context
        var confirmable = this;

        //if already confirmed back-off
        var isConfirmed =
            confirmable.confirmedAt && confirmable.confirmedAt != null;

        if (isConfirmed) {
            callback(null, confirmable);
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
                        confirmable.save(callback);
                    });
        }
    };

    //bind instance send confirmation method
    _.extend(self.model.attributes, {
        sendConfirmation: sendConfirmation
    });

};


/**
 *@description Extend model with confirm functionality
 */
Confirmable.prototype.bindModelConfirmation = function() {
    var self = this;

    function confirm(confirmationToken, callback) {
        //this refer to model context
        var Confirmable = this;

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
                            next(new Error('Invalid token'));
                        } else {
                            next(null, confirmable);
                        }
                    },
                    function(confirmable, next) {
                        //check if confirmation token expired
                        var isTokenExpiry = !Utils.isAfter(new Date(), confirmable.confirmationTokenExpiryAt);

                        if (isTokenExpiry) {
                            //if expired
                            next(new Error('Token expired'));
                        } else {
                            //otherwise continue with token verification
                            next(null, confirmable);
                        }
                    },
                    function(confirmable, next) {
                        //verify confirmation token
                        var value =
                            confirmable.confirmationTokenExpiryAt.getTime().toString()

                        Utils
                            .compare(value, confirmationToken, function(error, result) {
                                if (error) {
                                    next(error)
                                } else if (!result) {
                                    next(new Error('Invalid token'));
                                } else {
                                    //is valid token
                                    next(null, confirmable);
                                }
                            });
                    },
                    function(confirmable, next) {
                        //update confirmation details
                        confirmable.confirmedAt = new Date();
                        confirmable.save(next);
                    }
                ],
                function(error, confirmable) {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null, confirmable);
                    }
                });

    };

    //model static confirmation
    self.model.confirm = confirm;

};


module.exports = Confirmable;