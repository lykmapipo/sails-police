var police = require('sails-police');

var User = {};

//make User authenticable
police.morphAuthenticable(User);

//make user lockable
police.morphLockable(User);

//make user recoverable
police.morphRecoverable(User);

//make user registerable
police.morphRegisterable(User);

//make user trackable
police.morphTrackable(User);

module.exports = User;