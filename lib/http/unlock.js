/**
 * @function
 * @author lykmapipo
 *
 * @description  implementation of unclock confirmation
 */
function Unlock() {};


/**
 * @function
 * @author lykmapipo
 *
 * @description handle and process Http GET /unlock/:token
 *
 * @param {HttpRequest} request
 * @param {HttpResponse} response
 */
Unlock.prototype.getUnlock = function(request, response) {
    //TODO handle rest/api calls

    //grap unlock token from the request params
    var token = request.params.token;

    //unlock workflows
    require('sails-police')
        .getUser()
        .unlock(token, function(error, lockable) {
            if (error) {
                //if error encountered during unlock
                //log it
                //flash error message
                //and redirect to signin
                sails.log(error);

                sails.emit('lockable::unlock::error', error);

                request.flash('error', error.message);

                response.redirect('/signin');
            } else {
                //if success 
                //flash success message
                //and redirect to signin
                sails.log(lockable);

                sails.emit('lockable:unlocked::success', lockable);

                request.flash('success', 'Account unlocked successfully.');

                response.redirect('/signin');
            }
        });
};

/**
 * @description export unlock singleton
 * @type {Object}
 */
exports = module.exports = new Unlock();