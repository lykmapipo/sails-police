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
 * @description Handles blocking a user access after a certain number of attempts.
 *              It will send an email to the user when the lock happens,
 *              containing a link to unlock its account.
 *
 *              See {@link http://www.rubydoc.info/github/plataformatec/devise/master/Devise/Models/Lockable|Lockable}
 *
 * @private
 */
function Lockable() {

};

/**
 * @function
 * @author lykmapipo
 *
 * @description mix lockable to a given sails model
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model with lockable applied to it.
 *
 * @public
 */
Lockable.prototype.mixin = function(model) {
    //mix in lockable attributes
    this._mixinAttributes(model);

    //mix instance methods
    this._mixinInstanceMethods(model);

    //mix static methods
    this._mixinStaticMethods(model);

    //return model
    return model;
};


/**
 * @function
 * @author lykmapipo
 *
 * @description extend valid sails model with lockable attributes
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with lockable
 *                          required attributes
 */
Lockable.prototype._mixinAttributes = function(model) {

    //lockable attributes
    var attributes = {
        failedAttempts: {
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
        unlockSentAt: {
            type: 'datetime',
            defaultsTo: null
        },
        unlockTokenExpiryAt: {
            type: 'datetime',
            defaultsTo: null
        }
    };

    //mixin lockable attributes
    Helpers.mixAttributes(model, attributes);
};

/**
 * @function
 * @author lykmapipo
 *
 * @description extend valid sails model with lockable instance methods
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with lockable
 *                          required instance methods.
 */
Lockable.prototype._mixinInstanceMethods = function(model) {
    //bind  generate unlock token
    //as model instance method
    Helpers.mixAttributes(model, {
        generateUnlockToken: this._generateUnlockToken
    });

    //bind send unlock email
    //as model instance method
    Helpers.mixAttributes(model, {
        sendUnLockEmail: this._sendUnLockEmail
    });

    //bind lock
    //as model instance method
    Helpers.mixAttributes(model, {
        lock: this._lock
    });

};

/**
 * @function
 * @author lykmapipo
 *
 * @description extend valid sails model with lockable static methods
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with lockable
 *                          required static methods.
 */
Lockable.prototype._mixinStaticMethods = function(model) {
    //bind unlock
    //as model static method
    Helpers.mixStaticMethod(model, 'unlock', this._unlock);
};

/**
 * @function
 * @author lykmapipo
 *
 * @description generate unlock token to be used to unlock account locked.
 *              This  function must be called within sails model instamce context
 *
 * @param {generateUnlockToken~callback} done callback that handles the response.
 * @private
 */
Lockable.prototype._generateUnlockToken = function(done) {
    var lockable = this;
    //set unlock expiration date
    var unlockTokenExpiryAt = Utils.addDays(3);

    //generate unlock token based
    //on unlock token expiry at
    var tokenizer =
        Utils.tokenizer(unlockTokenExpiryAt.getTime().toString());

    var unlockToken = tokenizer.encrypt(lockable.email);

    //set unlockToken
    lockable.unlockToken =
        unlockToken;

    //set unlock token expiry date
    lockable.unlockTokenExpiryAt =
        unlockTokenExpiryAt;

    //clear previous unlock details if any
    lockable.unlockedAt = null;

    done(null, lockable);

};

//documentation for `done` callback of `generateUnlockToken`
/**
 * @description a callback to be called once generate unlock token is done
 * @callback generateUnlockToken~callback
 * @param {Object} error any error encountered during generating unlock token
 * @param {Object} lockable a lockable instance with `unlockToken`,
 *                             and `unlockTokenExpiryAt` set-ed
 */


/**
 * @function
 * @author lykmapipo
 *
 * @description send email to allow account to be unlocked.
 *              This method must be called within model instance context
 *
 * @param {sendUnLockEmail~callback} done callback that handles the response.
 * @private
 */
Lockable.prototype._sendUnLockEmail = function(next) {
    //this refer to model instance context
    var lockable = this;

    //if already unlocked back-off
    var isUnlocked =
        lockable.unlockedAt && lockable.unlockedAt != null;

    if (isUnlocked) {
        next(null, lockable);
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
                    lockable.save(next);
                });
    }
};

//documentation for `next` callback of `sendUnLockEmail`
/**
 * @description a callback to be called once send unlock email is done
 * @callback sendUnLockEmail~callback
 * @param {Object} error any error encountered during sending unlock email
 * @param {Object} lockable a lockable instance with `unlockSentAt`
 *                             updated and persisted
 */

/**
 * @function
 * @author lykmapipo
 *
 * @description lock the model instance.
 *              This  function must be called within sails model instamce context
 *
 * @param {lock~callback} done callback that handles the response.
 * @private
 */
Lockable.prototype._lock = function(done) {
    //this refer to model instance context
    var lockable = this;

    async
        .waterfall(
            [
                //TODO check if account is alredy locked
                function(next) {
                    //is it liable to be locked?
                    var isLockable =
                        lockable.failedAttempts && lockable.failedAttempts >= 5

                    //update locked at details
                    if (isLockable) {
                        lockable.lockedAt = new Date();
                    }

                    next(null, lockable);

                },
                function(lockable, next) {
                    lockable
                        .generateUnlockToken(next);
                },
                function(lockable, next) {
                    lockable
                        .sendUnLockEmail(next);
                }
            ],
            function(error, lockable) {
                if (error) {
                    done(error);
                } else {
                    done(null, lockable);
                }
            });
};

//documentation for `next` callback of `lock`
/**
 * @description a callback to be called once lock account is done
 * @callback lock~callback
 * @param {Object} error any error encountered during lock an account
 * @param {Object} lockable a lockable instance with `unlockSentAt`
 *                             updated and persisted
 */


/**
 * @function
 * @author lykmapipo
 *
 * @description unlcck locked account
 *              This  function must be called within sails model static context
 *
 * @param {unlock~callback} done callback that handles the response.
 * @private
 */
Lockable.prototype._unlock = function(unlockToken, done) {
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
                        lockable.unlockTokenExpiryAt.getTime().toString();

                    var tokenizer =
                        Utils.tokenizer(value);

                    if (!tokenizer.match(unlockToken, lockable.email)) {
                        next(new Error('Invalid unlock token'));
                    } else {
                        //is valid token
                        next(null, lockable);
                    }
                },
                function(lockable, next) {
                    //update unlock details
                    lockable.unlockedAt = new Date();
                    //clear failed attempts
                    if (lockable.failedAttempts) {
                        lockable.failedAttempts = 0
                    }

                    //clear lockedAt
                    if (lockable.lockedAt) {
                        lockable.lockedAt = null;
                    }

                    lockable.save(next);
                }
            ],
            function(error, lockable) {
                if (error) {
                    done(error);
                } else {
                    done(null, lockable);
                }
            });

};

//documentation for `next` callback of `unlock`
/**
 * @description a callback to be called once unlock account is done
 * @callback unlock~callback
 * @param {Object} error any error encountered during luock an account
 * @param {Object} lockable a lockable instance with `unlockedAt`
 *                             updated and persisted
 */


/**
 * @function
 * @author lykmapipo
 *
 * @description Compose lockable lock by generate and send unlock email details
 * @param {Object} lockable valid sails model morphed with sails-police
 * @param {composeLock~callback} done callback that handles the response.
 * @public
 */
Lockable.prototype.composeLock = function(lockable, done) {
    //this context is of Lockable

    async
        .waterfall(
            [
                function generateUnLockToken(next) {
                    lockable
                        .generateUnlockToken(next);
                },
                function sendUnlockEmail(lockable, next) {
                    lockable
                        .sendUnlockEmail(next);
                }
            ],
            function(error, lockable) {
                done(error, lockable);
            });
};

//documentation for `done` callback of `composeLock`
/**
 * @description a callback to be called once compose lock is done
 * @callback composeLock~callback
 * @param {Object} error any error encountered during the process of
 *                       composing lock
 * @param {Object} lockable a lockable instance with `unlockToken`,
 *                            `unlockTokenExpiryAt` and `unlockSentAt`
 *                            updated and persisted
 */


/**
 * @function
 * @author lykmapipo
 *
 * @description Check if lockable is locked by using the below flow:
 *              1. If not locked continue.
 *              2. If locked and lock token not expired throw
 *                  `Account locked. Check your email to unlock`
 *              3. If locked and lock token expired
 *                 `composeLock` and throw
 *                 `Account locked. Check your email to unlock`
 *
 * @param {Object} lockable valid sails model morphed with sails-police
 * @callback checkLock~callback done callback that handle response
 * @public
 */
Lockable.prototype.checkLock = function(lockable, done) {
    //this context is of Lockable
    var self = this;

    //check if already locked
    var isLocked =
        (lockable.lockedAt && lockable.lockedAt !== null);

    //check if unlock token expired
    var isUnlockTokenExpired =
        (!Utils.isAfter(new Date(), lockable.unlockTokenExpiryAt));

    //is not locked
    if (!isLocked) {
        done(null, lockable);
    }

    //is locked and
    //unlock token is not expired 
    else if (isLocked && !isUnlockTokenExpired) {
        done(new Error('Account locked. Check your email to unlock'));
    }

    //is locked and
    //unlock token is expired 
    else {
        //compose lock
        self
            .composeLock(lockable, function(error, lockable) {
                //is there any error during
                //compose new lock?
                if (error) {
                    done(error);
                }
                //new unlock token generated
                // and send successfully
                else {
                    done(new Error('Account locked. Check your email to unlock'));
                }
            });
    }
};

//documentation for `done` callback of `checkLock`
/**
 * @description a callback to be called once check lock is done
 * @callback checkLock~callback
 * @param {Object} error any error encountered during the process of checking
 *                       lock
 * @param {Object} lockable a lockable instance with `lockToken`,
 *                             `lockTokenExpiryAt` and `lockSentAt`
 *                             updated and persisted if lockable was not locked
 *                             and lock token was expired. Otherwise untouched
 *                             lockable instane.
 */


/**
 * @description export singleton
 * @type {Object}
 */
exports = module.exports = new Lockable();