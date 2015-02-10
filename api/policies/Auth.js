/**
 * Auth policy to ensure user is login
 *
 * Prevent users who aren't logged-in from accessing routes.
 */
module.exports = require('sails-police').policies.isAuthenticated;