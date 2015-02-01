var police = require('sails-police');

var User = {};

//mixin police morphs into User model
police.mixin(User);

module.exports = User;