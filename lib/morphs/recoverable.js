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

    this._extendModelAttributes();

    //return model
    return this.model;
};

Recoverable.prototype._extendModelAttributes = function() {
    //recoverable attributes
    var attributes = {
        recoveryToken: {
            type: 'string'
        },
        recoveryTokenExpiryAt: {
            type: 'datetime'
        },
        recoveryTokenSentAt: {
            type: 'datetime'
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