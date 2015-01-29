var sails = require('sails');

//lift sails
sails
    .lift({ // configuration for testing purposes
        port: 9090,
        environment: 'test',
        // log: {
        //     noShip: true
        // },
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
            return console.log(error);
        }
    });