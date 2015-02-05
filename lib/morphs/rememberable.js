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
 * @description Rememberable manages generating and clearing token for
 *              remember the user from a saved cookie. Rememberable also
 *              has utility methods for dealing with serializing the user
 *              into the cookie and back from the cookie, trying to lookup
 *              the record based on the saved information.
 *
 *              You probably wouldn't use rememberable methods directly,
 *              they are used mostly internally for handling the remember token.
 *
 *              See {@link http://www.rubydoc.info/github/plataformatec/devise/master/Devise/Models/Rememberable|Rememberable}
 *
 * @private
 */
function Rememberable() {

};

/**
 * @function
 * @author lykmapipo
 *
 * @description mix rememberable to a given sails model
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model with rememberable applied to it.
 *
 * @public
 */
Rememberable.prototype.mixin = function(model) {
    //mix in rememberable attributes
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
 * @description extend valid sails model with rememberable attributes
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with rememberable
 *                          required attributes
 */
Rememberable.prototype._mixinAttributes = function(model) {

    //rememberable attributes
    var attributes = {
        rememberMeToken: {
            type: 'string',
            defaultsTo: null,
            index: true
        },
        rememberMeTokenIssuedAt: {
            type: 'datetime',
            defaultsTo: null
        }
    };

    //mixin rememberable attributes
    Helpers.mixAttributes(model, attributes);
};

/**
 * @function
 * @author lykmapipo
 *
 * @description extend valid sails model with rememberable instance methods
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with rememberable
 *                          required instance methods.
 */
Rememberable.prototype._mixinInstanceMethods = function(model) {
    //bind  generate rememberable token
    //as model instance method
    Helpers.mixAttributes(model, {
        generateRememberMeToken: this._generateRememberMeToken
    });
};

/**
 * @function
 * @author lykmapipo
 *
 * @description extend valid sails model with rememberable static methods
 *
 * @param  {Object} model a valid sails model definition
 *                        See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @return {Object}       a sails model extended with rememberable
 *                          required static methods.
 */
Rememberable.prototype._mixinStaticMethods = function(model) {};



/**
 * @function
 * @author lykmapipo
 *
 * @description generate rememberable token to be used in remember me cookie.
 *              This  function must be called within sails model instamce context
 *
 * @param {generateRememberMeToken~callback} done callback that handles the response.
 * @private
 */
Rememberable.prototype._generateRememberMeToken = function(done) {
    //this context is of sails model instance
    var rememberable = this;

    //set remember me token issued time
    var rememberMeTokenIssuedAt = new Date();

    //generate rememberable token based
    //on rememberable token issued at
    var tokenizer =
        Utils.tokenizer(rememberMeTokenIssuedAt.getTime().toString());

    var rememberMeToken = tokenizer.encrypt(rememberable.email);

    //set rememberMeToken
    rememberable.rememberMeToken =
        rememberMeToken;

    //set rememberable token issued date
    rememberable.rememberMeTokenIssuedAt =
        rememberMeTokenIssuedAt;

    //return
    rememberable.save(done);
};

//documentation for `done` callback of `generateRememberMeToken`
/**
 * @description a callback to be called once generate remember me token is done
 * @callback generateRememberMeToken~callback
 * @param {Object} error any error encountered during generating remember me token
 * @param {Object} rememberable a rememberable instance with `rememberMeToken`,
 *                             and `rememberMeTokenIssuedAt` set-ed
 */


/**
 * @description export singleton
 * @type {Object}
 */
exports = module.exports = new Rememberable();