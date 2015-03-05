var _ = require('lodash');
var path = require('path');
var passport = require('passport');

var HttpUtils = require(path.join(__dirname, 'helpers'));

/**
 * @function
 * @author lykmapipo
 *
 * @description  implementation of registration/signup confirmation
 */
function Confirm() {};

/**
 * @function
 * @author lykmapipo
 *
 * @description handle and process Htpp GET /confirm/:token
 *
 * @param {HttpRequest} request
 * @param {HttpResponse} response
 */
Confirm.prototype.getConfirm = function(request, response) {
	//TODO handle rest/api calls
	
    //obtain confirmation token from
    //the request params
    var token = request.params.token;

    //confirm user registration
    require('sails-police')
        .getUser()
        .confirm(token, function(error, confirmable) {
            if (error) {
                //if any error encountered during
                //account confirmation 
                //log it and flash error message
                //and redirect user to signin
                sails.log(error);

                sails.emit('confirmable::confirm::error', error);

                request.flash('error', error.message);

                response.redirect('/signin');
            } else {
            	//if confirmation is successfully
            	//flash success message and
            	//redirect user to signin
                sails.log(confirmable);

                sails.emit('confirmable:confirm::success', confirmable);

                request.flash('success', 'Account confirmed successfully.');

                response.redirect('/signin');
            }
        });
};

/**
 * @description export confirm singleton
 * @type {Object}
 */
exports = module.exports = new Confirm();