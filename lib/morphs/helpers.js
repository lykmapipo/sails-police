/**
 * @constructor
 * @description conpose of police morphs helper
 */
function Helpers() {

}

/**
 * @function
 * @author lykmapipo
 * 
 * @description extend the given sails model with the provided attributes hash
 *
 * @param  {Object} model      a valid sails model
 *                             See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @param  {Object} attributes a hash contains valid sails model attributes definitions
 *                             See {@link http://sailsjs.org/#/documentation/concepts/ORM/Attributes.html|Sails model attributes}
 *
 * @return {Object}            a sails model extended with the provided attribues hash
 */
Helpers.prototype.mixAttributes = function(model, attributes) {

    //if model does not have attributes hash add it
    if (!model.attributes) {
        _.extend(model, {
            attributes: {}
        });
    }

    //extend model with attributes
    _.extend(model.attributes, attributes);
};

/**
 * @function
 * @author lykmapipo
 * 
 * @description extend sails model with static or class method
 * @param {Object} model       a valid sails model
 *                             See {@link http://sailsjs.org/#/documentation/concepts/ORM|Sails model}
 *
 * @param {Object} attributes  a hash contains valid sails model attributes definitions
 *                             See {@link http://sailsjs.org/#/documentation/concepts/ORM/Attributes.html|Sails model attributes}
 *
 * @return {Object}            a sails model extended with the provided static method
 */
Helpers.prototype.mixStaticMethod = function(model, methodName, method) {
    model[methodName] = method;
};

/**
 * @description export helpers singleton
 * @type {Object}
 */
exports = module.exports = new Helpers();