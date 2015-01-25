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

    //make model lockable
    this.initialize();

    //return model
    return this.model;
};

/**
 * @description initialize lockable
 */
Lockable.prototype.initialize = function() {
    //make model as lockable
    this.model.lockable = true;
    this.extendModelAttributes();
};

/**
 * @description extend model with lockable attributes
 */
Lockable.prototype.extendModelAttributes = function() {
    //lockable attributes
    var attributes = {
        failedAttempt: {
            type: 'integer',
            defaultsTo: 0,
            index: true
        },
        lockedAt: {
            type: 'datetime',
            defaultsTo: null
        },
        unlockToken: {
            type: 'string',
            defaultsTo: null,
            index: true
        },
        unlockTokenSentAt: {
            type: 'datetime',
            defaultsTo: null
        },
        unlockTokenExpiryAt: {
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

    //extend model with lockable attributes
    _.extend(this.model.attributes, attributes);

};

module.exports = Lockable;