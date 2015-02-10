var _ = require('lodash');
var path = require('path');
var passport = require('passport');

var HttpUtils = require(path.join(__dirname, 'helpers'));

/**
 * @function
 * @author lykmapipo
 *
 * @description implementation of change password workflows
 */
function Change() {};

/**
 * @function
 * @author lykmapipo
 *
 * @description handle and process Http GET /post
 *
 * @param {HttpRequest} request
 * @param {HttpResponse} response
 */
Change.prototype.getChange = function(request, response) {
    //TODO handlde rest/api calls

    //prepare response data
    var data = _.extend({
        title: 'Change password'
    }, HttpUtils.messages(request));

    //render views
    response
        .view('auth/change', data);
};


/**
 * @function
 * @author lykmapipo
 *
 * @description handle and process Http POST /change
 *
 * @param {HttpRequest} request
 * @param {HttpResponse} response
 */
Change.prototype.postChange = function(request, response) {
    //TODO handle rest/api calls

    //grap current password and new password
    //from the request body
    var currentPassword = request.body.current_password;
    var newPassword = request.body.new_password;

    //grab current signin authenticable
    var authenticable = request.user;

    //change password workflow
    async
        .waterfall(
            [
                function(next) {
                    authenticable
                        .comparePassword(currentPassword, next);
                },
                function(authenticable, next) {
                    authenticable
                        .changePassword(newPassword, next);
                }
            ],
            function(error, authenticable) {
                if (error) {
                    //if error encountered
                    //log it,
                    //flash error message 
                    //and redirect to change
                    sails.log(error);

                    sails.emit('authenticable::change:error', error);

                    request.flash('error', error.message);

                    response.redirect('/change');

                } else {
                    //if success 
                    //flash success message
                    //and redirect user to signin
                    sails.log(authenticable);

                    sails.emit('authenticable::change::successfully', authenticable);

                    request.flash('success', 'Password changed successfully');

                    request.logout();

                    response.redirect('/signin');
                }
            });
};

/**
 * @description export change singleton
 * @type {Change}
 */
exports = module.exports = new Change();