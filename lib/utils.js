var bcrypt = require('bcryptjs');

/**
 * @description common utilities used by sails-police
 * @type {Object}
 */
module.exports = {
    /**
     * @description hash a given token using bcryptjs with default of ten iterations
     * @param  {String}   token    a token to be hashed
     * @param  {Function} callback a callback to be called after hashing
     */
    hash: function(token, callback) {
        async
            .waterfall(
                [
                    //generate token salt
                    function generateSalt(next) {
                        bcrypt.genSalt(10, next);
                    },
                    //hash the token
                    function encryptToken(salt, next) {
                        bcrypt.hash(token, salt, next);
                    }
                ],
                function finalize(error, hash) {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null, hash);
                    }
                });
    }
}