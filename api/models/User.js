var police = require('sails-police');

var User = {};

//mixin police morphs into User model
police.model.mixin(User);

//implement sendEmail
//which is required by
//police to send email
User.attributes.sendEmail = function(type, user, done) {
    //if we send confirmation email
    if (type === police.EMAIL_REGISTRATION_CONFIRMATON) {
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
    };

    if (type === police.EMAIL_PASSWORD_RECOVERY) {
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
    };

    if (type === police.EMAIL_UNLOCK) {
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
    };
};

module.exports = User;