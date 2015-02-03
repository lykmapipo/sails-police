var async = require('async');
var passport = require('passport');
var async = require('async');
var _ = require('lodash');

module.exports = {
    /**
     * @description GET /signin
     * @param  {HttpRequest} request
     * @param  {HttpResponse} response
     */
    getSignin: function(request, response) {
        // save redirect url
        var suffix = request.query.redirect ? '?redirect=' + request.query.redirect : '';

        var error = request.flash('error');
        var success = request.flash('success');
        var warning = request.flash('warning');

        // render view
        response
            .view('auth/signin', {
                title: 'Signin',
                error: _.isEmpty(error) ? null : error,
                warning: _.isEmpty(warning) ? null : warning,
                success: _.isEmpty(success) ? null : success
            });
    },

    postSignin: function(request, response) {

        //custom passport authenticate
        async
            .waterfall(
                [
                    function(next) {
                        //authenticate authenticable
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
                    }
                ],
                function(error, authenticable) {
                    if (error) {
                        console.log(error);

                        sails.emit('signin:error', error);

                        request.flash('error', error.message);

                        response.redirect('/signin');

                    } else {
                        console.log(authenticable);
                        // emit 'login' event
                        sails.emit('authenticale::signin', authenticable);

                        request.flash('success', 'Login successfully')

                        response.redirect('/');
                    }
                });
    },

    /**
     * @description GET /signup
     * @param  {HttpRequest} request
     * @param  {HttpResponse} response
     */
    getSignup: function(request, response) {
        var credentials = {
            username: '',
            email: '',
            password: ''
        };
        response.view('auth/signup', _.extend({
            title: 'Sign up',
        }, credentials));
    },

    /**
     * @description POST /signup
     * @param  {HttpRequest} request
     * @param  {HttpResponse} response
     */
    postSignup: function(request, response) {
        //extract credentials from the request
        var credentials = {
            email: request.body.email,
            username: request.body.username,
            password: request.body.password
        };

        //registration workflow
        require('sails-police')
            .getUser()
            .register(credentials, function(error, registerable) {
                if (error) {
                    sails.emit('registerable::register::error', error);

                    request.flash('error', error.message);

                    response.redirect('/signup');
                } else {
                    // emit event
                    sails.emit('registerable::register::success', registerable);

                    request.flash('success', 'Signup successfully. Check your email for confirmation');

                    response.redirect('/signin');
                }
            });
    },

    /**
     * GET /confirm/:token
     *
     * @param {HttpRequest} request
     * @param {HttpResponse} response
     */
    getConfirm: function(request, response) {
        var token = request.params.token;

        require('sails-police')
            .getUser()
            .confirm(token, function(error, confirmable) {
                if (error) {
                    console.log(error);

                    sails.emit('confirmable::confirm::error', error);

                    request.flash('error', error.message);

                    response.redirect('/signin');
                } else {

                    sails.emit('confirmable:confirm::success', confirmable);

                    request.flash('success', 'Account cconfirmed successfully.');

                    response.redirect('/signin');
                }
            });
    },

    /**
     * @description GET /forgot
     *
     * @param {HttpRequest} request
     * @param {HttpResponse} response
     */
    getForgot: function(reguest, response) {
        response.view('auth/forgot', {
            title: 'Forgot password',
        });
    },

    /**
     * @description DELETE /signout
     *
     * @param {HttpRequest} request
     * @param {HttpResponse} response
     */
    deleteSignout: function(request, response) {
        var user = request.user;

        request.logout();

        sails.emit('authenticable::signout', user);

        request.flash('success', 'Signout successfully.');

        response.redirect('/signin');
    }
}