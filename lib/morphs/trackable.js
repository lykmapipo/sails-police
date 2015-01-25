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

    //make model trackable
    this.initialize();

    //return model
    return this.model;
};

/**
 *@description initialize trackable
 */
Trackable.prototype.initialize = function() {
    //mark model trackable
    this.model.trackable = true;

    this.extendModelAttributes();
};

/**
 *@description extend model with trackable attributes
 */
Trackable.prototype.extendModelAttributes = function() {
    //trackable attributes
    var attributes = {
        signInCount: {
            type: 'integer',
            defaultsTo: 0,
            index: true
        },
        currentSignInAt: {
            type: 'datetime',
            defaultsTo: null
        },
        currentSignInIpAddress: {
            type: 'string',
            index: true,
            defaultsTo: null
        },
        lastSignInAt: {
            type: 'datetime',
            defaultsTo: null
        },
        lastSignInIpAddress: {
            type: 'string',
            index: true,
            defaultsTo: null
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