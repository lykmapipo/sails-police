/**
 * @description sails-police configurations
 * @type {Object}
 */
module.exports.police = {
    authenticable: {
        /**
         * @description number of iteration to be used for
         *              encrypting the password. Default to 10 if no
         *              any value provided.
         *              If custom encryptPassword fuction is provided
         *              this value has no meaning default encrypt password
         *              mechanism is used.
         * @type {Number}
         */
        tokenIterations: 10,

        /**
         * @description custom encryption mechanism to encrypt password
         * @param  {String}   password a plain password to be encrypted
         * @param  {Function} done     a done callback
         */
        encryptPassword: function(password, done) {
            done(null, password);
        },
        error: {
            email: {
                email: '' //an error if no valid email provided
                required: '', //an error if no email provided
                unique: '' //an error if email already exists
            },
            password: {
                required: '' //an error if no password provided
            }
        }
    },
    confirmable: {
        tokenDuration: 3, //token duration since generation till it expired
        /**
         * @description a service to send confirmation. since we dont know
         *              how will you send you confirmation we default it as noop function.
         *              remember to call done after you through.
         * @type {Fuction}
         */
        sendConfirmation: function(registerable, done) {
            done(null, registerable);
        },
    },
    lockable: {
        maximumAttempts: 3
    },
    recoverable: {

    },
    registerable: {
        destroy: function(registerable, done) {
            done(null, registerable);
        }
    },
    trackable: {

    }
}