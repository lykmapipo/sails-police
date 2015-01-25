'use strict';
var _ = require('lodash');
var bcrypt = require('bcryptjs');
var moment = require('moment');

/**
 * @description Holds common settings for registerable and morph a
 *              model to be registerable aware.
 * @param {Boolean} model a sails model to be morped as registerable object
 * @public
 */
function Registerable(model) {
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
 * @description initialize registerable
 */
Registerable.prototype.initialize = function() {
    //mark model as registerable
    this.model.registerable = true;

    this.extendModelAttributes();
    this.bindModelRegisterMethod();
};

/**
 * @description extend model with registerable properties
 */
Registerable.prototype.extendModelAttributes = function() {
    //registerable attributes
    var attributes = {
        registeredAt: {
            type: 'datetime',
            defaultsTo: new Date()
        }
    };

    //if model doesnt have attributes hash add it
    if (!this.model.attributes) {
        _.extend(this.model, {
            attributes: {}
        });
    }

    //extend model with registerable attributes
    _.extend(this.model.attributes, attributes);

};

/**
 * @description Bind static/class level register model method
 */
Registerable.prototype.bindModelRegisterMethod = function() {
    var self = this;

    function register(registerable, callback) {
        var Registerable = this; //this refer to model context
        async
            .waterfall(
                [
                    //hash password
                    function(next) {
                        Registerable
                            .encryptPassword(registerable.password, next);
                    },
                    //generate confirmation token
                    function(passwordHash, next) {
                        registerable.password = passwordHash;
                        Registerable
                            .generateToken(next);
                    },
                    //update confirmation details
                    function(confirmationToken, next) {
                        //set confirmation token
                        registerable.confirmationToken = confirmationToken;

                        //set confirmation expiration date
                        var confirmationTokenExpiryAt =
                            moment().add(3, 'days');

                        registerable.confirmationTokenExpiryAt =
                            confirmationTokenExpiryAt.toDate();

                        next(null, registerable);
                    },
                    //create registerable and save it
                    function(registerable, next) {
                        //set registering time
                        registerable.registeredAt = new Date();

                        //create registerable
                        Registerable
                            .create(registerable)
                            .exec(next);
                    },
                    //send a confirmation token
                    function(registerable, next) {
                        Registerable
                            .sendConfirmation(registerable, next);
                    },
                    //update confirmation send details
                    function(registerable, next) {
                        registerable.confirmationSentAt = new Date();
                        registerable.save(next);
                    }
                ],
                function finalize(error, registerable) {
                    if (error) {
                        callback(error);
                    }

                    callback(null, registerable);
                });

    }

    self.model.register = register;
};



// export registerable
module.exports = Registerable;