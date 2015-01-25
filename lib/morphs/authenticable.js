'use strict';
var _ = require('lodash');
var bcrypt = require('bcryptjs');
var async = require('async');

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
    this.bindModelGenerateToken();
    this.bindModelComparePassword();
    this.bindModelEncryptPassword();
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
 *@description Extend model with token generation functionality
 */
Authenticable.prototype.bindModelGenerateToken = function() {
    var self = this;

    function generateToken(callback) {
        var today = new Date().getTime().toString();
        //TODO use/find/create npm module for 
        //token generation and comparison
        async
            .waterfall(
                [
                    //generate token salt
                    function generateSalt(next) {
                        bcrypt.genSalt(10, next);
                    },
                    //hash the token
                    function encryptToken(salt, next) {
                        bcrypt.hash(today, salt, next);
                    }
                ],
                function finalize(error, hash) {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null, hash);
                    }
                });
    };

    self.model.generateToken = generateToken;
};

/**
 * @description Bind static/class and instance level
 *              encryptPassword model method
 */
Authenticable.prototype.bindModelEncryptPassword = function() {
    var self = this;

    function encryptPassword(password, callback) {
        //is password provided
        if (!password) {
            callback(new Error('Unspecified password'));
        }

        async
            .waterfall(
                [
                    //generate password salt
                    function generateSalt(next) {
                        bcrypt.genSalt(10, next);
                    },
                    //hash the password
                    function encryptPassword(salt, next) {
                        bcrypt.hash(password, salt, next);
                    }
                ],
                function finalize(error, hash) {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null, hash);
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
 * @description Bind static/class and instance level
 *              comparePassword model method
 */
Authenticable.prototype.bindModelComparePassword = function() {
    var self = this;

    function comparePassword(password, hash, callback) {
        if (!password) {
            callback(new Error('Unspecified password'))
        }

        if (!hash) {
            callback(new Error('Unspecified hash'))
        }

        bcrypt.compare(password, hash, callback);
    };

    //bind class comparePassword method
    self.model.comparePassword = comparePassword;

    //bind instance comparePassword method
    _.extend(self.model.attributes, {
        comparePassword: comparePassword
    });
};


module.exports = Authenticable;