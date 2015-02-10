var _ = require('lodash');
var path = require('path');
var passport = require('passport');

var HttpUtils = require(path.join(__dirname, 'helpers'));

/**
 * @function
 * @author lykmapipo
 *
 * @description implentation of recover workflows
 */
function Recover() {};

/**
 * @function
 * @author lykmapipo
 *
 * @description handle  and process Http GET /recover/:token
 *
 * @param {HttpRequest} request
 * @param {HttpResponse} response
 */
Recover.prototype.getRecover = function(request, response) {
    //TODO handle rest/api calls

    //grap recover token from the params
    var token = request.params.token;

    //prepare response data
    var data = _.extend({
        title: 'Recover password',
        token: token,
    }, HttpUtils.messages(request));

    //render view
    response
        .view('auth/recover', data);
};

/**
 * @function
 * @author lykmapipo
 *
 * @description handle and process Http POST /recover
 *
 * @param {HttpRequest} request
 * @param {HttpResponse} response
 */
Recover.prototype.postRecover = function(request, response) {
    //TODO handle rest/api calls

    //grap recover token and new password
    //from the request body
    var token = request.body._token;
    var password = request.body.password;

    //password recover workflows
    require('sails-police')
        .getUser()
        .recover(token, password, function(error, recoverable) {
            if (error) {
                //if error encountered
                //log it,
                //flash error message
                //and redirect to signin
                sails.log(error);

                sails.emit('recoverable::recover::error', error);

                request.flash('error', error.message);

                response.redirect('/signin');
            } else {
                //if succeed
                //flash success message
                //and redirect to signin
                sails.log(recoverable);

                sails.emit('recoverable::recover::success', recoverable);

                request.flash('success', 'Account recovered successfully');

                response.redirect('/signin');
            }
        });
};


/**
 * @description exports forget singleton
 * @type {Object}
 */
exports = module.exports = new Recover();