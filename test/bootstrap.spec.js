//TODO install chai && supertest
//TODO move test config in test rc
//load sails in test mode
/**
 * This file is useful when you want to execute some
 * code before and after running your tests
 * (e.g. lifting and lowering your sails application):
 */
var sails = require('sails');
var Promise = require('bluebird');
/**
 * Lifting sails before all tests
 */
before(function(done) {
    sails
        .lift({ // configuration for testing purposes
            port: 7070,
            environment: 'test',
            log: {
                noShip: true
            },
            models: {
                migrate: 'drop'
            },
            hooks: {
                // blueprints: false,
                // controllers: false,
                // cors: false,
                // csrf: false,
                grunt: false, //we dont need grunt in test
                // http: false,
                // i18n: false,
                // logger: false,
                // moduleloader: false,
                // orm: false,
                // policies: false,
                pubsub: false,
                // request: false,
                // responses: false,
                // services: false,
                // session: false,
                sockets: false,
                // userconfig: false,
                // userhooks: false,
                // views: false
            }
        }, function(error, sails) {
            if (error) {
                return done(error);
            }
            done(null, sails);
        });
});


/**
 * Lowering sails after done testing
 */
after(function(done) {
    Promise
        .all([User.destroy()])
        .then(function(result) {
            sails.lower(done);
        })
        .catch(function(error) {
            done(error);
        });
});