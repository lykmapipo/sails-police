/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */
var police = require('sails-police');

module.exports.bootstrap = function(cb) {

    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    police
        .setTransport(function(type, user, done) {
            //if we send confirmation email
            if (type === police.NOTIFICATION_TYPES.REGISTRATION_CONFIRMATON) {
                sails
                    .hooks
                    .email
                    .send(
                        'confirm', {
                            recipientName: user.username,
                            senderName: 'Sails Police',
                            token: user.confirmationToken
                        }, {
                            to: user.email,
                            subject: 'Account confirmation'
                        },
                        function(error) {
                            done();
                        }
                    );
            }

            if (type === police.NOTIFICATION_TYPES.PASSWORD_RECOVERY_CONFIRMATON) {
                sails
                    .hooks
                    .email
                    .send(
                        'recover', {
                            recipientName: user.username,
                            senderName: 'Sails Police',
                            token: user.recoveryToken
                        }, {
                            to: user.email,
                            subject: 'Account Recovery'
                        },
                        function(error) {
                            done();
                        }
                    );
            }

            if (type === police.NOTIFICATION_TYPES.UNLOCK_CONFIRMATON) {
                sails
                    .hooks
                    .email
                    .send(
                        'unlock', {
                            recipientName: user.username,
                            senderName: 'Sails Police',
                            token: user.unlockToken
                        }, {
                            to: user.email,
                            subject: 'Account Locked'
                        },
                        function(error) {
                            done();
                        }
                    );
            }
        });

    cb();
};