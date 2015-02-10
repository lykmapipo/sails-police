var _ = require('lodash');
var path = require('path');
var passport = require('passport');

var HttpUtils = require(path.join(__dirname, 'helpers'));

/**
 * @function
 * @author lykmapipo
 *
 * @description implementation of signup workflows
 */
function SignUp() {};

/**
 * @function
 * @author lykmapipo
 *
 * @description handle and process Http GET /signup
 * @param  {HttpRequest} request
 * @param  {HttpResponse} response
 */
SignUp.prototype.getSignup = function(request, response) {
    //TODO handle rest/api calls
    
    //prepare response
    //data
    var credentials = {
        username: '',
        email: '',
        password: ''
    };

    var data = _.extend({
            title: 'Sign up',
        }, credentials,
        HttpUtils.messages(request)
    );

    //render response
    response
        .view('auth/signup', data);
};

/**
 * @function
 * @author lykmapipo
 *
 * @description handle and process Http POST /signup
 * @param  {HttpRequest} request
 * @param  {HttpResponse} response
 */
SignUp.prototype.postSignup = function(request, response) {
	//TODO handle rest/api calls
	
    //extract credentials from the request body
    var credentials = {
        email: request.body.email,
        username: request.body.username,
        password: request.body.password
    };

    //register credentials
    require('sails-police')
        .getUser()
        .register(credentials, function(error, registerable) {
            if (error) {
            	//if any error encountered during
            	//registering credentials 
            	//log it and flash error message
            	//and redirect user to signup
                sails.log(error);

                sails.emit('registerable::register::error', error);

                request.flash('error', error.message);

                response.redirect('/signup');
            } else {
            	//if registeration is successfully
            	//flash success message
            	//and redirect user to signin
                sails.log(registerable);

                sails.emit('registerable::register::success', registerable);

                request.flash('success', 'Signup successfully. Check your email for confirmation');

                response.redirect('/signin');
            }
        });
};


/**
 * @description export signup singleton
 * @type {SignUp}
 */
exports = module.exports = new SignUp();