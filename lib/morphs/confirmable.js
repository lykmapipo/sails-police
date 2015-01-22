'use strict';
var _ = require('lodash');

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

    this._extendModelAttributes();

    //return model
    return this.model;
};

Confirmable.prototype._extendModelAttributes = function() {
    //confirmable attributes
    var attributes = {
        confirmationToken: {
            type: 'string'
        },
        confirmationTokenExpiryAt: {
            type: 'datetime'
        },
        confirmedAt: {
            type: 'datetime'
        },
        confirmationSentAt: {
            type: 'datetime'
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

module.exports = Confirmable;