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
    this.bindModelUnlock();
    this.bindModelLock();
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

/**
 * @descriptio Extend model instance with lock ability
 */
Lockable.prototype.bindModelLock = function() {
    var self = this;

    function lock(callback) {
        //this refer to model instance context
        var lockable = this;

        async
            .waterfall(
                [
                    function(next) {
                        //is it liable to be locked?
                        var isLockable =
                            lockable.failedAttempt && lockable.failedAttempt >= 5
                            //update locked at details
                        if (isLockable) {
                            lockable.lockedAt = new Date();
                        }

                        lockable.save(next);
                    }
                ],
                function(error, lockable) {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null, lockable);
                    }
                });
    }

    //bind instance lock method
    _.extend(self.model.attributes, {
        lock: lock
    });
};

/**
 *@description Extend model with unlock functionality
 */
Lockable.prototype.bindModelUnlock = function() {
    var self = this;

    function unlock(unlockToken, callback) {
        //this refer to model context
        var Lockable = this;

        async
            .waterfall(
                [
                    function(next) {
                        //find lockable using unlock token
                        Lockable
                            .findOneByUnlockToken(unlockToken)
                            .exec(function(error, lockable) {
                                next(error, lockable);
                            });
                    },
                    function(lockable, next) {
                        //any lockable found?
                        if (_.isUndefined(lockable)) {
                            next(new Error('Invalid unlock token'));
                        } else {
                            next(null, lockable);
                        }
                    },
                    function(lockable, next) {
                        //check if unlock token expired
                        var isTokenExpired = !Utils.isAfter(new Date(), lockable.unlockTokenExpiryAt);

                        if (isTokenExpired) {
                            //if expired
                            next(new Error('Unlock token expired'));
                        } else {
                            //otherwise continue with token verification
                            next(null, lockable);
                        }
                    },
                    function(lockable, next) {
                        //verify locktoken
                        var value =
                            lockable.unlockTokenExpiryAt.getTime().toString()

                        Utils
                            .compare(value, unlockToken, function(error, result) {
                                if (error) {
                                    next(error)
                                } else if (!result) {
                                    next(new Error('Invalid unlock token'));
                                } else {
                                    //is valid token
                                    next(null, lockable);
                                }
                            });
                    },
                    function(lockable, next) {
                        //update unlock details
                        lockable.unlockedAt = new Date();
                        //clear failed attempts
                        if (lockable.failedAttempt) {
                            lockable.failedAttempt = 0
                        }

                        lockable.save(next);
                    }
                ],
                function(error, lockable) {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null, lockable);
                    }
                });

    };

    //model static unlock
    self.model.unlock = unlock;

};

module.exports = Lockable;