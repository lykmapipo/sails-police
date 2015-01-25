'use strict';
var _ = require('lodash');

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
        recoveryTokenSentAt: {
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

module.exports = Recoverable;