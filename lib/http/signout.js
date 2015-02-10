/**
 * @function
 * @author lykmapipo
 *
 * @description  implementation of signout workflows
 */
function Signout() {};

/**
 * @function
 * @author lykmapipo
 *
 * @description handle and process Http DELETE /signout
 *
 * @param {HttpRequest} request
 * @param {HttpResponse} response
 */
Signout.prototype.deleteSignout = function(request, response) {
    //TODO handle rest/api calls

    //grab user from the request
    var user = request.user;

    //log out user
    request.logout();

    //clear remember_me
    response.clearCookie('remember_me');

    //flash signout success message
    //and redirect to signin
    sails.emit('authenticable::signout', user);

    request.flash('success', 'Signout successfully.');

    response.redirect('/signin');
};


/**
 * @description export signup singleton
 * @type {Object}
 */
exports = module.exports = new Signout();