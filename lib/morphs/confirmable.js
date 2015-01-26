'use strict';
var _ = require('lodash');
var path = require('path');
var moment = require('moment');
var Utils = require(path.join(__dirname, '..', 'utils'));

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
        //TODO call send of the registered transport
        this.confirmationSentAt = new Date();
        this.save(callback);
    };

    //bind instance send confirmation method
    _.extend(self.model.attributes, {
        sendConfirmation: sendConfirmation
    });

};


module.exports = Confirmable;