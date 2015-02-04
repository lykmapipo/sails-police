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
 * @description Registerable is responsible for everything related to
 *              registering a new account (ie user sign up) and unregistering.
 *
 *              See {@link http://www.rubydoc.info/github/plataformatec/devise/master/Devise/Models/Registerable|Registerable}
 *
 * @private
 */
function Registerable() {

};

/**
 * @function
 * @author lykmapipo
 *
 * @description mix cregisterable to a given sails model
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model with cregisterable applied to it.
 *
 * @public
 */
Registerable.prototype.mixin = function(model) {
    //mix in registerable attributes
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
 * @description extend valid sails model with cregisterable attributes
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with cregisterable
 *                          required attributes
 */
Registerable.prototype._mixinAttributes = function(model) {

    //registerable attributes
    var attributes = {
        //track when registration occur
        registeredAt: {
            type: 'datetime',
            defaultsTo: null
        },
        //track when un registration occur
        //since we cant predict how to handle account deletion
        unregisteredAt: {
            type: 'datetime',
            defaultsTo: null
        }
    };


    //mixin cregisterable attributes
    Helpers.mixAttributes(model, attributes);
};

/**
 * @function
 * @author lykmapipo
 *
 * @description extend valid sails model with registerable instance methods
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with registerable
 *                          required instance methods.
 */
Registerable.prototype._mixinInstanceMethods = function(model) {
    //bind  unregister
    //as model instance method
    Helpers.mixAttributes(model, {
        unregister: this._unregister
    });
};

/**
 * @function
 * @author lykmapipo
 *
 * @description extend valid sails model with cregisterable static methods
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with cregisterable
 *                          required static methods.
 */
Registerable.prototype._mixinStaticMethods = function(model) {
    //bind account registering
    //as model static method
    Helpers.mixStaticMethod(model, 'register', this._register);
};


/**
 * @function
 * @author lykmapipo
 *
 * @description register new account
 *              This method must be called within model static context
 *
 * @param  {Object}   credentials valid account credential.
 * @param {register~callback} done callback that handles the response.
 * @private
 */
Registerable.prototype._register = function(credentials, done) {
    //this refer to model sattic context
    var Registerable = this;

    //TODO sanitize credentials
    async
        .waterfall(
            [
                //instantiate new registerable
                function(next) {
                    next(null, Registerable.new(credentials));
                },
                //hash password
                function(registerable, next) {
                    registerable.encryptPassword(next);
                },
                //generate confirmation token
                function(registerable, next) {
                    registerable.generateConfirmationToken(next);
                },
                //create registerable and save it
                function(registerable, next) {
                    //set registering time
                    registerable.registeredAt = new Date();
                    //create registerable
                    registerable.save(next);
                },
                //send a confirmation token
                function(registerable, next) {
                    registerable.sendConfirmationEmail(next);
                }
            ],
            function finalize(error, registerable) {
                if (error) {
                    done(error);
                } else {
                    done(null, registerable);
                }
            });
};

//documentation for `done` callback of `register`
/**
 * @description a callback to be called once register new account is done
 * @callback register~callback
 * @param {Object} error any error encountered during register new account
 * @param {Object} registerable a registerable instance with all attributes
 *                             set-ed and persisted
 */



/**
 * @function
 * @author lykmapipo
 *
 * @description un register a given model instance.
 *              This  function must be called within sails model instamce context
 *
 * @param {gunregister ~callback} done callback that handles the response.
 * @private
 */
Registerable.prototype._unregister = function(done) {
    //this refer to model instance context
    var registerable = this;

    async
        .waterfall(
            [
                function(next) {
                    //set unregisteredAt
                    if (!registerable.unregisteredAt) {
                        registerable.unregisteredAt = new Date();
                    }

                    //save unregistered details
                    registerable.save(next);
                }
            ],
            function(error, registerable) {
                if (error) {
                    done(error);
                } else {
                    done(null, registerable);
                }
            });
};

//documentation for `done` callback of `unregister`
/**
 * @description a callback to be called once gunregister account is done
 * @callback unregister~callback
 * @param {Object} error any error encountered during unregistering account
 * @param {Object} registerable a registerable instance with `unregisteredAt` set-ed
 */


/**
 * @description export singleton
 * @type {Object}
 */
exports = module.exports = new Registerable();