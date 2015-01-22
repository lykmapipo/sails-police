'use strict';
var _ = require('lodash');

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

    this._extendModelAttributes();

    //return model
    return this.model;
};

Authenticable.prototype._extendModelAttributes = function() {
    //authenticable attributes
    var attributes = {
        email: {
            type: 'email',
            unique: true
        },
        password: {
            type: 'string'
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

module.exports = Authenticable;