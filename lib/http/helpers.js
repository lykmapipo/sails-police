var _ = require('lodash');


/**
 * @function
 * @author lykmapipo
 * 
 * @description `sails-police` http helpers.
 */
function Helpers() {}

/**
 * @function
 * @author lykmapipo
 * 
 * @description deduce flash messages from a request
 * @param  {HttpRequest} request a valid HttpRequest
 * @return {Object}         a hash containing all flashh messages found
 *                            in the request
 */
Helpers.prototype.messages = function(request) {
    var error = request.flash('error');
    var success = request.flash('success');
    var warning = request.flash('warning');

    return {
        error: _.isEmpty(error) ? null : error,
        warning: _.isEmpty(warning) ? null : warning,
        success: _.isEmpty(success) ? null : success
    }
};

/**
 * @description export http helpers singleton
 * @type {Helpers}
 */
module.exports = new Helpers()