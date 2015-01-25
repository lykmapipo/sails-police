'use strict';
var _ = require('lodash');
var bcrypt = require('bcryptjs');

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
 *@description Extend model with send confirmation token functionality
 */
Confirmable.prototype.bindModelSendConfirmation = function() {
    var self = this;

    function sendConfirmation(registerable, callback) { //nop send confirmation
        callback(null, registerable);
    };

    self.model.sendConfirmation = sendConfirmation;
};

module.exports = Confirmable;