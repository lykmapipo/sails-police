var _ = require('lodash');
var path = require('path');
var passport = require('passport');

var HttpUtils = require(path.join(__dirname, 'helpers'));

/**
 * @function
 * @author lykmapipo
 *
 * @description  implementation of unregister/destroy workflows
 */
function Delete() {};


/**
 * @description export delete singleton
 * @type {Object}
 */
exports = module.exports = new Delete();