'use strict';
var _ = require('lodash');

/**
 * @description Holds common settings for tracking and morph a
 *              model to be trackable.
 * @param {Boolean} model a sails model to be morped as authentication trackable object
 * @public
 */
function Trackable(model) {
    if (!model) {
        throw new Error('Unspecified model');
    }

    this.model = model;

    this._extendModelAttributes();

    //return model
    return this.model;
};

Trackable.prototype._extendModelAttributes = function() {
    //trackable attributes
    var attributes = {
        signInCount: {
            type: 'integer',
            defaultsTo: 0
        },
        currentSignInAt: {
            type: 'datetime'
        },
        currentSignInIpAddress: {
            type: 'string'
        },
        lastSignInAt: {
            type: 'datetime'
        },
        lastSignInIpAddress: {
            type: 'string'
        }
    };

    //if model doesnt have attributes hash add it
    if (!this.model.attributes) {
        _.extend(this.model, {
            attributes: {}
        });
    }

    //extend model with trackable attributes
    _.extend(this.model.attributes, attributes);

};

module.exports = Trackable;