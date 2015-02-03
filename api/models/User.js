var police = require('sails-police');

var User = {};

//mixin police morphs into User model
police.model.mixin(User);

module.exports = User;