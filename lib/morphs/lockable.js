'use strict';
var _ = require('lodash');

/**
 * @description Holds common settings for lockable and morph a
 *              model to be lockable aware.
 * @param {Boolean} model a sails model to be morped as lockable object
 * @public
 */
function Lockable(model) {
    if (!model) {
        throw new Error('Unspecified model');
    }

    this.model = model;

    this._extendModelAttributes();

    //return model
    return this.model;
};

Lockable.prototype._extendModelAttributes = function() {
    //lockable attributes
    var attributes = {
        failedAttempt: {
            type: 'integer'
        },
        lockedAt: {
            type: 'datetime'
        },
        unlockToken: {
            type: 'string'
        },
        unlockTokenSentAt: {
            type: 'datetime'
        },
        unlockTokenExpiryAt: {
            type: 'datetime'
        }
    };

    //if model doesnt have attributes hash add it
    if (!this.model.attributes) {
        _.extend(this.model, {
            attributes: {}
        });
    }

    //extend model with lockable attributes
    _.extend(this.model.attributes, attributes);

};

module.exports = Lockable;