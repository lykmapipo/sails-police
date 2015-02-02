var async = require('async');

module.exports = {
    getSignin: function(request, response) {
        // save redirect url
        var suffix = request.query.redirect ? '?redirect=' + request.query.redirect : '';

        // render view
        response.view('auth/signin', {
            title: 'Signin',
            error: '',
            login: '',
            action: sails.config.devise.login.route + suffix || '/login'
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
        response.view('auth/get_signup', _.extend({
            title: 'Sign up',
            error: ''
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
            password: request.body.password
        };

        //registration workflow
        require('sails-police')
            .getUser()
            .register(credentials, function(error, registerable) {
                if (error) {
                    sails.emit('signup::post::error', error);
                    // render template with error message
                    response.status(403);
                    response
                        .view('auth/get_signup', _.extend({
                            title: 'Sign up',
                            error: error,
                        }, credentials));
                } else {
                    // emit event
                    sails.emit('signup::post', registerable);
                    //TODO redirect to login with flash message
                    console.log(registerable);

                    response
                        .view('auth/post_signup', {
                            title: 'Sign up - Email sent'
                        });
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

        console.log(token)

        require('sails-police')
            .getUser()
            .confirm(token, function(error, confirmable) {
                if (error) {
                    sails.emit('confirmable::confirm::error', error);

                    response
                        .view('auth/link_expired', {
                            title: 'Sign up - Email verification link expired',
                            error: error
                        });
                } else {
                    sails.emit('confirmable:confirm', confirmable);

                    response
                        .view('auth/email_verification_succeed', {
                            title: 'Sign up success'
                        });
                }
            });
    },

    getForgot: function(reguest, response) {
        response.view('auth/get_forget_password', {
            title: 'Forgot password',
            error: ''
        });
    },
}