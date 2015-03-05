var _ = require('lodash');
var path = require('path');
var passport = require('passport');
var async = require('async');

var HttpUtils = require(path.join(__dirname, 'helpers'));

/**
 * @function
 * @author lykmapipo
 *
 * @description implentation signin workflows
 */
function SignIn() {};


/**
 * @function
 * @author lykmapipo
 *
 * @description handle and process Http GET /signin
 * @param  {HttpRequest} request
 * @param  {HttpResponse} response
 */
SignIn.prototype.getSignin = function(request, response) {
    //TODO handle rest/api call

    //prepare response
    //view data
    var data = _.extend({
        title: 'Signin'
    }, HttpUtils.messages(request));

    // render view
    response
        .view('auth/signin', data);
};

/**
 * @function
 * @author lykmapipo
 *
 * @description handle and process Http POST /signin
 * @param  {HttpRequest} request
 * @param  {HttpResponse} response
 */
SignIn.prototype.postSignin = function(request, response) {
    //TODO handle rest/api signin

    //grab remember_me from request body
    var rememberMe = request.body.remember_me;

    //custom passport authenticate
    async
        .waterfall(
            [
                function(next) {
                    //authenticate authenticable
                    //using police passport local
                    //configuration
                    passport
                        .authenticate(
                            'police-local',
                            function(error, authenticable) {
                                if (error) {
                                    next(error);
                                } else {
                                    next(null, authenticable);
                                }
                            })(request, response, next);
                    //Note!: the above next is async
                    //waterfall next callback and not
                    //next in middleware chain
                },
                function(authenticable, next) {
                    //login authenticable
                    request
                        .logIn(authenticable, function(error) {
                            if (error) {
                                next(error);
                            } else {
                                next(null, authenticable);
                            }
                        });
                },
                function(authenticable, next) {
                    //track authenticable
                    authenticable.track(request.ip, next);
                },
                function(authenticable, next) {
                    //setting initial remember me token
                    //as documented at 
                    //https://github.com/jaredhanson/passport-remember-me#setting-the-remember-me-cookie
                    if (!rememberMe) {
                        next(null, authenticable);
                    } else {
                        authenticable
                            .generateRememberMeToken(function(error, authenticable) {
                                if (error) {
                                    next(error);
                                } else {
                                    //set remember me cookie
                                    response
                                        .cookie(
                                            'remember_me',
                                            authenticable.rememberMeToken, {
                                                httpOnly: true,
                                                maxAge: sails.config.session.cookie.maxAge || 24 * 60 * 60 * 1000
                                            });

                                    next(null, authenticable);
                                }
                            });
                    }
                }
            ],
            function(error, authenticable) {
                if (error) {
                    //if error encountered during signin
                    //log it and flash the error message
                    //and redirect user to signin
                    sails.log(error);

                    sails.emit('signin:error', error);

                    request.flash('error', error.message);

                    response.redirect('/signin');

                } else {
                    //if successfully signin
                    //flash success message and
                    //redirect user to /
                    sails.log(authenticable);
                    // emit 'login' event
                    sails.emit('authenticale::signin', authenticable);

                    request.flash('success', 'Login successfully')

                    response.redirect('/');
                }
            });
};


/**
 * @description export http signin singleton
 * @type {Helpers}
 */
exports = module.exports = new SignIn();