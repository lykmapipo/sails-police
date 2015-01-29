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
    this.bindModelUnRegisterMethod();
};

/**
 * @description extend model with registerable properties
 */
Registerable.prototype.extendModelAttributes = function() {
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

    function register(subject, callback) {
        var Registerable = this; //this refer to model context
        async
            .waterfall(
                [
                    //instantiate new registerable
                    function(next) {
                        next(null, Registerable.new(subject));
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
                        registerable.sendConfirmation(next);
                    }
                ],
                function finalize(error, registerable) {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null, registerable);
                    }
                });
    };

    self.model.register = register;
};

/**
 * @description bind instance unregister model method
 */
Registerable.prototype.bindModelUnRegisterMethod = function() {
    var self = this;

    function unregister(callback) {
        var registerable = this; //this refer to model instance context

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
                        callback(error);
                    } else {
                        callback(null, registerable);
                    }
                });
    };

    //bind model instance unregister
    _.extend(self.model.attributes, {
        unregister: unregister
    });
};

// export registerable
module.exports = Registerable;