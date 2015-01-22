'use strict';
var _ = require('lodash');

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

    this._extendModelAttributes();

    //return model
    return this.model;
};

Registerable.prototype._extendModelAttributes = function() {
    //registerable attributes
    var attributes = {
        registeredAt: {
            type: 'datetime',
            defaultsTo: 'NOW'
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

module.exports = Registerable;