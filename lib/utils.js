var crypto = require('crypto');
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
    },
    /**
     * @description adding offset number of days into the date given else today
     * @param {Date} date   date to offset
     * @param {Integer} offset days to add on date
     * @param {Date}        date with days added
     */
    addDays: function(offset, date) {
        var date = date || new Date();
        var momentAt = moment(date).add(offset, 'days');
        return momentAt.toDate();
    },

    tokenizer: function(secret) {
        if (!secret) {
            throw Error('Missing secret key');
        }
        return new Tokenizer(secret);
    }
}

function Tokenizer(secret) {
    this.cipher = crypto.createCipher('aes-256-cbc', secret);
    this.decipher = crypto.createDecipher('aes-256-cbc', secret);
};

Tokenizer.prototype.encrypt = function(text) {
    var crypted = this.cipher.update(text, 'utf8', 'hex');
    crypted += this.cipher.final('hex');
    return crypted;

};

Tokenizer.prototype.decrypt = function(text) {
    var dec = this.decipher.update(text, 'hex', 'utf8');
    dec += this.decipher.final('utf8');
    return dec;
};

Tokenizer.prototype.match = function(token, text) {
    return this.decrypt(token) === text;
};