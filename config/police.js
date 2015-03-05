/**
 * @description sails-police configurations
 * @type {Object}
 */
module.exports.police = {
	//routes configurations
	//affect how routes.mixin
	//work internal
    routes: {
    	//a path where all
    	//sails-police routes will
    	//be relative to
    	//Example if you specify mount path
    	//the /login route wi
    	//i.e mountPath/login
        mountPath: ''
    }
}