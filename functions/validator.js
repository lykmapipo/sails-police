/** @module authr-signup */
var async = require('async');
var validate = require('validate.js');

JSON.flatten = function(data) {
    var result = {};

    function recurse(cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
            for (var i = 0, l = cur.length; i < l; i++)
                recurse(cur[i], prop + "[" + i + "]");
            if (l === 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop + "." + p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
};

JSON.unflatten = function(data) {
    "use strict";
    if (Object(data) !== data || Array.isArray(data))
        return data;
    var result = {},
        cur, prop, idx, last, temp;
    for (var p in data) {
        cur = result, prop = "", last = 0;
        do {
            idx = p.indexOf(".", last);
            temp = p.substring(last, idx !== -1 ? idx : undefined);
            cur = cur[prop] || (cur[prop] = (!isNaN(parseInt(temp)) ? [] : {}));
            prop = temp;
            last = idx + 1;
        } while (idx >= 0);
        cur[prop] = data[p];
    }
    return result[""];
}

validate.validators.unique = function(val, options, key, attributes) {
    return validate.Promise(function(resolve, reject) {
        var obj = {};
        obj[key] = val;
        obj = JSON.unflatten(obj);
        options.Adapter.isValueTaken(obj, key, function(err, isTaken) {
            if (isTaken) {
                reject(new Error('this value is taken'));
            } else {
                resolve();
            }
        });
    });
};

/**
 * @param {Object} config - authr config
 * @param {Object} signup - cser object to be persisted to the database
 * @param {validateCallback} callback - callback to execute when signup finishes
 */
var Validate = function(config, signup, callback) {
    var constraints = {};
    var current_constraint;
    var signup_flat = JSON.flatten(signup);
    if (config.custom) {
        for (var constraint in config.custom) {
            if (config.custom[constraint].path) {
                current_constraint = constraints[config.custom[constraint].path] = {};
            } else {
                current_constraint = constraints[constraint] = {};
            }
            for (var rule in config.custom[constraint]) {
                if (rule != 'path') {
                    if (rule == 'unique') {
                        var opts = {
                            Adapter: config.Adapter
                        };
                        current_constraint[rule] = opts;
                    } else {
                        current_constraint[rule] = config.custom[constraint][rule];
                    }
                }
            }
        }
        var validation = validate.async(signup_flat, constraints).then(function() {
            callback(null, signup);
        }, function(err) {
            callback(err, signup);
        });

    } else {
        return callback(new Error('Custom field definitions are required for validation'));
    }
};

module.exports = Validate;