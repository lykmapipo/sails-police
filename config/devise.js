/**
 * Device configurations
 * @type {Object}
 */
//TODO move mail type to templates
module.exports.devise = {
    rest: false, //if rest is allowed
    login: {
        route: '/login' //Route that handles the login process
    },
    signup: {
        tokenExpiration: '1 day'
    },
    logout: {
        route: '/logout'
    },
    verification: {
        route: '/verification'
    },
    forgotPassword: {
        route: '/forgot_password',
        tokenExpiration: '1 day'
    },
    maximumAllowedFailedLoginAttempts: 5,
    accountLockedDuration: '20 minutes',
    failedLoginsWarning: 3,
    mail: {
        appName: 'Sails',
        appUrl: 'http://localhost:1337', //auto deduce this not set it
        from: 'scala.lally@gmail.com',
        template: 'mail_template.ejs',
        type: 'SMTP',
        settings: {
            service: 'gmail',
            type: 'SMTP',
            auth: {
                user: 'scala.lally@gmail.com',
                pass: 'la0259lykmapipo'
            }
        },
        type: {
            // email signup template
            signup: {
                subject: 'Welcome to <%- appName %>',
                text: [
                    '<h2>Hello <%- username %></h2>',
                    'Welcome to <%- appName %>.',
                    '<p><%- link %> to complete your registration.</p>'
                ].join(''),
                linkText: 'Click here'
            },

            // email already taken template
            signupTaken: {
                subject: 'Email already registered',
                text: [
                    '<h2>Hello <%- username %></h2>',
                    'you or someone else tried to sign up for <%- appName %>.',
                    '<p>Your email is already registered and you cannot sign up twice.',
                    ' If you haven\'t tried to sign up, you can safely ignore this email. Everything is fine!</p>',
                    '<p>The <%- appName %> Team</p>'
                ].join('')
            },

            // resend signup template
            resendVerification: {
                subject: 'Complete your registration',
                text: [
                    '<h2>Hello <%- username %></h2>',
                    'here is the link again. <%- link %> to complete your registration.',
                    '<p>The <%- appName %> Team</p>'
                ].join(''),
                linkText: 'Click here'
            },

            // forgot password template
            forgotPassword: {
                subject: 'Reset your password',
                text: [
                    '<h2>Hey <%- username %></h2>',
                    '<%- link %> to reset your password.',
                    '<p>The <%- appName %> Team</p>'
                ].join(''),
                linkText: 'Click here'
            }

        }

    }
}
