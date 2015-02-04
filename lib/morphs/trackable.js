'use strict';
var async = require('async');
var path = require('path');
var moment = require('moment');

//police utilities
var Utils = require(path.join(__dirname, '..', 'utils'));

//police morphs helpers
var Helpers = require(path.join(__dirname, 'helpers'));

/**
 * @constructor
 * @author lykmapipo
 *
 * @description Track information about your user sign in.
 *              See {@link http://www.rubydoc.info/github/plataformatec/devise/master/Devise/Models/Trackable|Trackable}
 *
 * @private
 */
function Trackable() {

};

/**
 * @function
 * @author lykmapipo
 *
 * @description mix trackable to a given sails model
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model with trackable applied to it.
 *
 * @public
 */
Trackable.prototype.mixin = function(model) {
    //mix in trackable attributes
    this._mixinAttributes(model);

    //mix instance methods
    this._mixinInstanceMethods(model);

    //return model
    return model;
};


/**
 * @function
 * @author lykmapipo
 *
 * @description extend valid sails model with trackable attributes
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with trackable
 *                          required attributes
 */
Trackable.prototype._mixinAttributes = function(model) {

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

    //mixin confrimable attributes
    Helpers.mixAttributes(model, attributes);
};

/**
 * @function
 * @author lykmapipo
 *
 * @description extend valid sails model with trackable instance methods
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with trackable
 *                          required instance methods.
 */
Trackable.prototype._mixinInstanceMethods = function(model) {
    //bind  trackable track
    //model instance method
    Helpers.mixAttributes(model, {
        track: this._track
    });
};

/**
 * @function
 * @author lykmapipo
 *
 * @description update tracking details of the model instance.
 *              This method must be called within mode instance context.
 *
 * @param  {String}   ipAddress current remote ip address user using to sign in with
 * @param {track~callback} done callback that handles the response.
 * @private
 */
Trackable.prototype._track = function(ipAddress, done) {
    //this refer model insatnce context

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
    this.save(done);
};

//documentation for `done` callback of `track`
/**
 * @description a callback to be called once update trackable details is done
 * @callback track~callback
 * @param {Object} error any error encountered during update tracking details
 * @param {Object} confrimable a confirmable instance with `lastSignInAt`, `lastSignInIpAddress`
 *                             `currentSignInAt`, `currentSignInIpAddress` updated and persisted
 */

/**
 * @description export singleton
 * @type {Object}
 */
exports = module.exports = new Trackable();