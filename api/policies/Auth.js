/**
 * Auth policy to ensure user is login
 *
 * Prevent users who aren't logged-in from accessing routes.
 *
 * Use `sails.config.devise.login.route` devise configuration for redirection.
 *
 * Function also remembers the requested url
 * and user is redirected after successful login.
 *
 * If `rest` is enabled you'll get a `401` response.
 *
 * @param  {[type]}   request  [http request]
 * @param  {[type]}   response [http response]
 * @param  {Function} next     [next middleware to be executed]
 */
module.exports = require('sails-police').policies.isAuthenticated;