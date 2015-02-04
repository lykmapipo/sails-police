//external dependencies
var _ = require('lodash');
var passport = require('passport');

//morphs
var Authenticable = require('./lib/morphs/authenticable.js');
var confirmable = require('./lib/morphs/confirmable.js');
var Lockable = require('./lib/morphs/lockable.js');
var Recoverable = require('./lib/morphs/recoverable.js');
var Registerable = require('./lib/morphs/registerable.js');
var Trackable = require('./lib/morphs/trackable.js');
var Passport = require('./lib/http/passport.js');

/**
 * Represents a new Police instance.
 * @class
 * @param {object} config - Configuration options for instance.
 */

function Police() {
    //notification type constant
    this.NOTIFICATION_TYPES = {
        REGISTRATION_CONFIRMATON: 'Registration confirmation',
        REGISTRATION_CONFIRMATON_RESEND: 'Registration confirmation resent',
        UNLOCK_CONFIRMATON: 'Unlock confirmation',
        UNLOCK_CONFIRMATON_RESEND: 'Unlock confirmation resent',
        PASSWORD_RECOVERY_CONFIRMATON: 'Password recovery confirmation',
        PASSWORD_RECOVERY_CONFIRMATON_RESEND: 'Password recovery confirmation resend'
    };

    //add default console notification transport
    this.transport = function(type, authenticable, done) {
        done();
    };

};

/**
 * @descriptio Mixin whole of police morphs into the given model
 * @param  {Object} model a sails model to mix in police morphs
 * @return {Object}       a sails model mixed with police morphs
 */
Police.prototype.model = {
    /**
     * @description mixin all sails-police morps into a model and extend it
     * @param  {Object} model valid sails model to be mixed with sails-police morphs
     * @return {Object}       valid sails model extended with sails-police morphs
     */
    mixin: function(model) {
        //mixin authenticable
        model = new Authenticable(model);

        //apply confirmable
        model = confirmable.mixin(model);

        //mixin lockable
        model = new Lockable(model);

        //mixin recoverable
        model = new Recoverable(model);

        //mixin registerable
        model = new Registerable(model);

        //mixin trackble
        model = new Trackable(model);

        return model;
    }
};

/**
 * @description Lazy evaluate User model used by sails-police
 * @return {Object} current User model sails-police is using
 */
Police.prototype.getUser = function() {
    //return default user model
    if (!this.User) {
        this.User = User || sails.models.user;
    }
    return this.User;
};

/**
 * @description Set transport to use when send notifications
 * @param {Function} transport a function that implemented custom send notification
 */
Police.prototype.setTransport = function(transport) {
    //we currently support functional transport
    if (!_.isFunction(transport)) {
        throw new Error('Unsupported transport instance type')
    }
    this.transport = transport;
};

Police.prototype.setUser = function(User) {
    this.User = User;
};

//initialize passport
Police.prototype.initialize = function() {
    //initialize police passports
    new Passport();

    //return passportjs initialize
    //so that it can be added to sails middlewares
    return passport.initialize();
}

//initialize passport session
Police.prototype.session = function() {
    return passport.session();
}

Police.prototype.policies = {
    isAuthenticated: function isAuthenticated(request, response, next) {
        var loginRoute = '/signin';

        if (request.isAuthenticated()) {
            next();
        } else {
            response.redirect(loginRoute);
        }
    },

    mixin: function(policies) {
        return _.extend(policies, {
            'AuthController': {
                getSignin: true,
                postSignin: true,
                getSignup: true,
                postSignup: true,
                getConfirm: true,
                getForgot: true,
                postForgot: true,
                getRecover: true,
                postRecover: true,
                getLocked: true,
                postLocked: true
            }
        });
    }
};


Police.prototype.routes = {
    mixin: function(routes) {
        return _.extend(routes, {
            'get /signin': 'AuthController.getSignin',
            'post /signin': 'AuthController.postSignin',
            'get /signout': 'AuthController.deleteSignout', //TODO make use of DELETE
            'get /signup': 'AuthController.getSignup',
            'post /signup': 'AuthController.postSignup',
            'get /confirm/:token': 'AuthController.getConfirm', //TODO make use of PUT
            'get /forgot': 'AuthController.getForgot',
            'post /forgot': 'AuthController.postForgot',
            'get /recover/:token': 'AuthController.getRecover',
            'post /recover': 'AuthController.postRecover',
            'get /locked': 'AuthController.getLocked',
            'post /locked': 'AuthController.postLocked'
        });
    }
};

/**
 * @description expose police middlewares populator
 * @type {Object}
 */
Police.prototype.middlewares = {
    /**
     * @description mixin police middlewares into sails middlewares
     * @param  {Object} middlewares sails js middlewares
     * @return {Object}             sailsjs middlewares extended with police middlewares
     */
    mixin: function(middlewares) {
        //remember current sails http config object
        var previousMiddlewares = middlewares;

        //remember current sails http middlewares
        var previousOrder = middlewares.middleware.order;

        //grab the current index of the sails router middleware
        //from sails middleware order
        var indexOfRouter = previousOrder.indexOf('router');

        //patching sails middleware and
        //adding police middlewares
        middlewares.middleware = _.extend(previousMiddlewares.middleware, {
            //police middleware to inject locals
            //which will store errors, warnings and success messages
            //they are heavily used in default views if police
            //to constitute messages
            policeLocals: function(request, response, next) {
                response.locals.error = null;
                response.locals.warning = null;
                response.locals.success = null;
                return next();
            },

            //police middleare to initialize passport police
            //and passportjs
            policeInit: exports.initialize(),

            //police middleware to inialize
            //passportjs session
            policeSession: exports.session()
        });

        //patching sails middleware order and add
        //police middlewares before router in the middleware order
        previousOrder.splice(indexOfRouter, 0, 'policeLocals', 'policeInit', 'policeSession');
        middlewares.middleware.order = previousOrder;

        //return patched sails http config object
        return middlewares;
    }
};

/**
 * Export default singleton.
 *
 * @api public
 */
exports = module.exports = new Police();