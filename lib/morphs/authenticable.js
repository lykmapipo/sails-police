'use strict';
var _ = require('lodash');
var path = require('path');
var bcrypt = require('bcryptjs');
var async = require('async');
var Utils = require(path.join(__dirname, '..', 'utils'));
/**
 * @description Holds common settings for authentication and morph a
 *              model to be authentication aware.
 * @param {Boolean} model a sails model to be morped as authentication object
 * @public
 */
function Authenticable(model) {
    if (!model) {
        throw new Error('Unspecified model');
    }

    //extend model with sails-model-new
    model['new'] = require('sails-model-new');

    this.model = model;

    //make model registerable
    this.initialize();

    //return model
    return this.model;
};

/**
 * @description initialize authenticable
 */
Authenticable.prototype.initialize = function() {
    //mark model as authenticable
    this.model.authenticable = true;

    this.extendModelAttributes();
    this.bindModelComparePassword();
    this.bindModelEncryptPassword();
    this.bindModelAuthenticate();
};

/**
 * @description extend model with authenticable attributes
 */
Authenticable.prototype.extendModelAttributes = function() {
    //authenticable attributes
    var attributes = {
        email: {
            type: 'email',
            unique: true,
            required: true
        },
        password: {
            type: 'string',
            required: true
        }
    };

    //if model doesnt have attributes hash add it
    if (!this.model.attributes) {
        _.extend(this.model, {
            attributes: {}
        });
    }

    //extend model with authenticable attributes
    _.extend(this.model.attributes, attributes);

};


/**
 * @description Bind static/class and instance level
 *              encryptPassword model method
 */
Authenticable.prototype.bindModelEncryptPassword = function() {
    var self = this;

    function encryptPassword(callback) {
        var authenticable = this;

        Utils
            .hash(authenticable.password, function(error, hash) {
                if (error) {
                    callback(error);
                } else {
                    authenticable.password = hash;
                    callback(null, authenticable);
                }
            });
    };

    //bind static/class encryptPassword method
    self.model.encryptPassword = encryptPassword;

    //bind instance encryptPassword method
    _.extend(self.model.attributes, {
        encryptPassword: encryptPassword
    });
};

/**
 * @description Bind instance level comparePassword model method
 */
Authenticable.prototype.bindModelComparePassword = function() {
    var self = this;

    function comparePassword(password, callback) {
        var authenticable = this;

        bcrypt
            .compare(password, this.password, function(error, result) {
                if (error) {
                    callback(error);
                } else if (result) {
                    callback(null, authenticable);
                } else {
                    callback(null, result);
                }
            });
    };

    //bind instance comparePassword method
    _.extend(self.model.attributes, {
        comparePassword: comparePassword
    });
};

/**
 * @description Bind instance level comparePassword model method
 */
Authenticable.prototype.bindModelAuthenticate = function() {
    var self = this;

    function authenticate(credentials, callback) {
        var Authenticable = this;

        async
            .waterfall(
                [
                    //find authenticable by emails
                    function(next) {
                        Authenticable
                            .findOneByEmail(credentials.email)
                            .exec(next)
                    },
                    //TODO check if is confirmed
                    //TODO if confirmation expiry update it and resent
                    //compare password
                    function(authenticable, next) {
                        authenticable
                            .comparePassword(credentials.password, next);
                    }
                    //TODO update trackable information
                ],
                function(error, authenticable) {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null, authenticable);
                    }
                });

    };

    //bind instance comparePassword method
    self.model.authenticate = authenticate;
};


module.exports = Authenticable;