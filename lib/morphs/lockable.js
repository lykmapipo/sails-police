'use strict';
var _ = require('lodash');
var path = require('path');
var moment = require('moment');
var Utils = require(path.join(__dirname, '..', 'utils'));

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
    this.bindModelGenerateUnlockToken();
    this.bindModelSendLock();
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
        unlockedAt: {
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

/**
 *@description Extend model with unlock token generate functionality
 */
Lockable.prototype.bindModelGenerateUnlockToken = function() {
    var self = this;

    function generateUnlockToken(callback) {
            var lockable = this;
            //set unlock expiration date
            var unlockTokenExpiryAt = Utils.addDays(3);

            //generate unlock token based
            //on unlock token expiry at
            Utils
                .hash(
                    unlockTokenExpiryAt.getTime().toString(),
                    function(error, unlockToken) {
                        if (error) {
                            callback(error);
                        } else {
                            //set unlockToken
                            lockable.unlockToken =
                                unlockToken;

                            //set unlock token expiry date
                            lockable.unlockTokenExpiryAt =
                                unlockTokenExpiryAt;

                            //clear previous unlock details if any
                            lockable.unlockedAt = null;

                            callback(null, lockable)
                        }
                    });

        }
        //bind instance generate unlock token method
    _.extend(self.model.attributes, {
        generateUnlockToken: generateUnlockToken
    });
};

/**
 *@description Extend model with send lock token functionality
 */
Lockable.prototype.bindModelSendLock = function() {
    var self = this;

    function sendLock(callback) {
        //this refer to model instance context
        var lockable = this;

        //if already unlocked back-off
        var isUnlocked =
            lockable.unlockedAt && lockable.unlockedAt != null;

        if (isUnlocked) {
            callback(null, lockable);
        } else {
            //transport lock
            var police = require('sails-police');

            police
                .transport(
                    police.NOTIFICATION_TYPES.UNLOCK_CONFIRMATON,
                    lockable,
                    function done() {
                        //update unlock token send time
                        lockable.unlockTokenSentAt = new Date();
                        lockable.save(callback);
                    });
        }
    }

    //bind instance send lock method
    _.extend(self.model.attributes, {
        sendLock: sendLock
    });
};

module.exports = Lockable;