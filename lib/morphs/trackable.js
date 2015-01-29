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
    this.bindModelTrack();
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
            type: 'ip',
            index: true,
            defaultsTo: null
        },
        lastSignInAt: {
            type: 'datetime',
            defaultsTo: null
        },
        lastSignInIpAddress: {
            type: 'ip',
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

/**
 * @description Bind instance level track method
 */
Trackable.prototype.bindModelTrack = function() {
    var self = this;

    function track(ipAddress, callback) {

        //update signInCount
        if (!this.signInCount) {
            this.signInCount = 0;
        }
        this.signInCount = this.signInCount + 1;

        //update previous sign in details
        if (!this.currentSignInAt) {
            this.currentSignInAt = null;
        }
        this.lastSignInAt = this.currentSignInAt;

        if (!this.currentSignInIpAddress) {
            this.currentSignInIpAddress = null;
        }
        this.lastSignInIpAddress = this.currentSignInIpAddress;

        //update current sign in details
        this.currentSignInAt = new Date();
        this.currentSignInIpAddress = ipAddress;

        //save tracking details
        this.save(callback);
    }

    //bind instance comparePassword method
    _.extend(self.model.attributes, {
        track: track
    });
};

module.exports = Trackable;