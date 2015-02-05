var async = require('async');
var passport = require('passport');
var async = require('async');
var _ = require('lodash');

function messages(request) {
    var error = request.flash('error');
    var success = request.flash('success');
    var warning = request.flash('warning');

    return {
        error: _.isEmpty(error) ? null : error,
        warning: _.isEmpty(warning) ? null : warning,
        success: _.isEmpty(success) ? null : success
    }
}

//TODO add logs
module.exports = {
    /**
     * @description GET /signin
     * @param  {HttpRequest} request
     * @param  {HttpResponse} response
     */
    getSignin: function(request, response) {
        // save redirect url
        var suffix = request.query.redirect ? '?redirect=' + request.query.redirect : '';

        var data = _.extend({
            title: 'Signin'
        }, messages(request));

        // render view
        response
            .view('auth/signin', data);
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
                    },
                    function(authenticable, next) {
                        //track authenticable
                        authenticable.track(request.ip, next);
                    }
                ],
                function(error, authenticable) {
                    if (error) {
                        sails.log(error);

                        sails.emit('signin:error', error);

                        request.flash('error', error.message);

                        response.redirect('/signin');

                    } else {
                        sails.log(authenticable);
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
                    sails.log(error);

                    sails.emit('registerable::register::error', error);

                    request.flash('error', error.message);

                    response.redirect('/signup');
                } else {
                    sails.log(registerable);
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
                    sails.log(error);

                    sails.emit('confirmable::confirm::error', error);

                    request.flash('error', error.message);

                    response.redirect('/signin');
                } else {
                    sails.log(confirmable);

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
    getForgot: function(request, response) {

        var data = _.extend({
            title: 'Forgot password'
        }, messages(request));

        response.view('auth/forgot', data);
    },

    /**
     * @description POST /forgot
     *
     * @param {HttpRequest} request
     * @param {HttpResponse} response
     */
    postForgot: function(request, response) {
        var email = request.body.email;

        async.waterfall(
            [
                function(next) {
                    require('sails-police')
                        .getUser()
                        .findOneByEmail(email)
                        .exec(function(error, recoverable) {
                            next(error, recoverable);
                        });
                },
                //check if there recoverable found
                function(recoverable, next) {
                    if (_.isUndefined(recoverable) ||
                        _.isNull(recoverable)) {
                        next(new Error('Incorrect email. No account found.'));
                    } else {
                        next(null, recoverable);
                    }
                },
                function(recoverable, next) {
                    recoverable
                        .generateRecoveryToken(next);
                },
                function(recoverable, next) {
                    recoverable
                        .sendRecoveryEmail(next);
                }
            ],
            function(error, recoverable) {
                if (error) {
                    sails.log(error);

                    sails.emit('recoverable::request:error', error);

                    request.flash('error', error.message);

                    response.redirect('/forgot');
                } else {
                    sails.log(recoverable);

                    sails.emit('recoverable::request::success', recoverable);

                    request.flash('success', 'Check your email for recovery instructions.');

                    response.redirect('/signin');
                }
            });
    },

    /**
     * @description GET /recover/:token
     *
     * @param {HttpRequest} request
     * @param {HttpResponse} response
     */
    getRecover: function(request, response) {
        var token = request.params.token;

        var data = _.extend({
            title: 'Recover password',
            token: token,
        }, messages(request));

        response.view('auth/recover', data);
    },

    /**
     * @description POST /recover
     *
     * @param {HttpRequest} request
     * @param {HttpResponse} response
     */
    postRecover: function(request, response) {
        var token = request.body._token;
        var password = request.body.password;

        require('sails-police')
            .getUser()
            .recover(token, password, function(error, recoverable) {
                if (error) {
                    sails.log(error);

                    sails.emit('recoverable::recover::error', error);

                    request.flash('error', error.message);

                    response.redirect('/signin');
                } else {
                    sails.log(recoverable);

                    sails.emit('recoverable::recover::success', recoverable);

                    request.flash('success', 'Account recovered successfully');

                    response.redirect('/signin');
                }
            });
    },

    /**
     * @description GET /locked
     *
     * @param {HttpRequest} request
     * @param {HttpResponse} response
     */
    getLocked: function(request, response) {

        var data = _.extend({
            title: 'Unlock account'
        }, messages(request));

        response.view('auth/locked', data);
    },

    /**
     * @description POST /locked
     *
     * @param {HttpRequest} request
     * @param {HttpResponse} response
     */
    postLocked: function(request, response) {
        var email = request.body.email;

        async.waterfall(
            [
                function(next) {
                    require('sails-police')
                        .getUser()
                        .findOneByEmail(email)
                        .exec(function(error, lockable) {
                            next(error, lockable);
                        });
                },
                //check if there lockable found
                function(lockable, next) {
                    if (_.isUndefined(lockable) ||
                        _.isNull(lockable)) {
                        next(new Error('Incorrect email. No account found.'));
                    } else {
                        next(null, lockable);
                    }
                },
                function(lockable, next) {
                    lockable
                        .generateUnlockToken(next);
                },
                function(lockable, next) {
                    lockable
                        .sendUnlockEmail(next);
                }
            ],
            function(error, lockable) {
                if (error) {
                    sails.log(error);

                    sails.emit('lockable::request:error', error);

                    request.flash('error', error.message);

                    response.redirect('/locked');
                } else {
                    sails.log(lockable);

                    sails.emit('lockable::request::success', lockable);

                    request.flash('success', 'Check your email for unlock instructions.');

                    response.redirect('/signin');
                }
            });
    },

    /**
     * GET /unlock/:token
     *
     * @param {HttpRequest} request
     * @param {HttpResponse} response
     */
    getUnlock: function(request, response) {
        var token = request.params.token;

        require('sails-police')
            .getUser()
            .unlock(token, function(error, lockable) {
                if (error) {
                    sails.log(error);

                    sails.emit('lockable::unlock::error', error);

                    request.flash('error', error.message);

                    response.redirect('/signin');
                } else {
                    sails.log(lockable);

                    sails.emit('lockable:unlocked::success', lockable);

                    request.flash('success', 'Account unlocked successfully.');

                    response.redirect('/signin');
                }
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

        sails.log(user);

        request.flash('success', 'Signout successfully.');

        response.redirect('/signin');
    }
}