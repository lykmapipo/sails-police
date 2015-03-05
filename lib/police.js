//external dependencies
var _ = require('lodash');
var passport = require('passport');

//paths
var path = require('path')
var morphsPath = path.join(__dirname, 'morphs');
var httpPath = path.join(__dirname, 'http');

//morphs
var authenticable = require(path.join(morphsPath, 'authenticable'));
var confirmable = require(path.join(morphsPath, 'confirmable'));
var lockable = require(path.join(morphsPath, 'lockable'));
var recoverable = require(path.join(morphsPath, 'recoverable'));
var registerable = require(path.join(morphsPath, 'registerable'));
var trackable = require(path.join(morphsPath, 'trackable'));

//http
var Passport = require(path.join(httpPath, 'passport'));
var signin = require(path.join(httpPath, 'signin'));
var signup = require(path.join(httpPath, 'signup'));
var confirm = require(path.join(httpPath, 'confirm'));
var forgot = require(path.join(httpPath, 'forgot'));
var recover = require(path.join(httpPath, 'recover'));
var signout = require(path.join(httpPath, 'signout'));
var unlock = require(path.join(httpPath, 'unlock'));
var change = require(path.join(httpPath, 'change'));

/**
 * Represents a new Police instance.
 * @class
 * @param {object} config - Configuration options for instance.
 */

function Police() {
    //email notification type constant
    this.EMAIL_REGISTRATION_CONFIRMATON = 'Registration confirmation';
    this.EMAIL_UNLOCK = 'Unlock confirmation';
    this.EMAIL_PASSWORD_RECOVERY = 'Password recovery confirmation';

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
        //extend model with sails-model-new
        if (!model['new']) {
            model['new'] = require('sails-model-new');
        };

        //mixin authenticable
        model = authenticable.mixin(model);

        //apply confirmable
        model = confirmable.mixin(model);

        //mixin lockable
        model = lockable.mixin(model);

        //mixin recoverable
        model = recoverable.mixin(model);

        //mixin registerable
        model = registerable.mixin(model);

        //mixin trackble
        model = trackable.mixin(model);

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
};

//initialize passport session
Police.prototype.session = function() {
    return passport.session();
};


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
                getUnlock: true
            }
        });
    }
};

/**
 * @description police controller mixins
 * @type {Object}
 */
Police.prototype.controller = {
    /**
     * @description user management workflow in the given controller
     * @param  {[type]} controller a valid sails js controller
     * @return {Object}            valid sails controller extended with
     *                                   user management workflows
     */
    mixin: function(controller) {
        if (!controller) {
            controller = {};
        }

        return _.extend({
                getSignin: signin.getSignin,
                postSignin: signin.postSignin
            }, {
                getSignup: signup.getSignup,
                postSignup: signup.postSignup
            }, {
                getConfirm: confirm.getConfirm
            }, {
                getForgot: forgot.getForgot,
                postForgot: forgot.postForgot
            }, {
                getRecover: recover.getRecover,
                postRecover: recover.postRecover
            }, {
                deleteSignout: signout.deleteSignout
            }, {
                getUnlock: unlock.getUnlock
            }, {
                getChange: change.getChange,
                postChange: change.postChange
            },
            //disable sails controller 
            //action,rest and shortcuts
            {
                _config: {
                    actions: false,
                    rest: false,
                    shortcuts: false
                }
            },
            //override defaults handlers with user supplied
            //handlers
            controller
        );
    }
};

Police.prototype.routes = {
    mixin: function(routes) {
        return _.extend(routes, { //TODO make use of method-override
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
            'get /unlock/:token': 'AuthController.getUnlock',
            'get /change': 'AuthController.getChange',
            'post /change': 'AuthController.postChange'
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
 * @description export police singleton.
 * @api public
 */
exports = module.exports = new Police();