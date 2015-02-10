var _ = require('lodash');
var path = require('path');
var passport = require('passport');
var async = require('async');

var HttpUtils = require(path.join(__dirname, 'helpers'));

/**
 * @function
 * @author lykmapipo
 *
 * @description implentation of forget workflows
 */
function Forgot() {};

/**
 * @function
 * @author lykmapipo
 *
 * @description handle and process Http GET /forgot
 *
 * @param {HttpRequest} request
 * @param {HttpResponse} response
 */
Forgot.prototype.getForgot = function(request, response) {
    //TODO handle rest/api calls

    //prepare response data
    var data = _.extend({
        title: 'Forgot password'
    }, HttpUtils.messages(request));

    //render view
    response
        .view('auth/forgot', data);
};

/**
 * @function
 * @author lykmapipo
 *
 * @description handle and process Http POST /forgot
 *
 * @param {HttpRequest} request
 * @param {HttpResponse} response
 */
Forgot.prototype.postForgot = function(request, response) {
    //TODO handle rest/api calls

    //grab email from the request body
    var email = request.body.email;

    //forgot password workflow
    async
        .waterfall(
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
                    //if there is any error encounter
                    //log it
                    //flash error and redirect to
                    //forgot
                    sails.log(error);

                    sails.emit('recoverable::request:error', error);

                    request.flash('error', error.message);

                    response.redirect('/forgot');
                } else {
                    //if succeeed
                    //flash success message
                    //and redirect to signin
                    sails.log(recoverable);

                    sails.emit('recoverable::request::success', recoverable);

                    request.flash('success', 'Check your email for recovery instructions.');

                    response.redirect('/signin');
                }
            });
};


/**
 * @description exports forget singleton
 * @type {Object}
 */
exports = module.exports = new Forgot();