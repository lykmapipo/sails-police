var bcrypt = require('bcryptjs');
var moment = require('moment');

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
    },
    /**
     * @description compare original value and the given hash
     * @param  {String}   value    a value to be compared
     * @param  {String}   hash     a hash to compare
     * @param  {Function} callback
     */
    compare: function(value, hash, callback) {
        bcrypt
            .compare(value, hash, callback);
    },
    /**
     * @description check if the second date is after the first date
     * @param  {Date}  first  a first date
     * @param  {Date}  second a second date
     * @return {Boolean}        true if second date is later that first date
     */
    isAfter: function(first, second) {
        var firstMoment = moment(first);
        var secondMoment = moment(second);
        return secondMoment.isAfter(firstMoment);
    }
}