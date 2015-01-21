var should = require('chai').should();
var blanket = require('blanket');
var Authr = require('../index.js');

describe('email verification module', function () {
  var authr;
  var config;
  var user;
  beforeEach(function (done) {
    config = {
      db: {
        type: 'nedb'
      },
      user: {
        username: 'username',
        password: 'password',
        account_locked: 'account_locked',
        account_locked_until: 'account_locked_until',
        account_failed_attempts: 'account_failed_attempts',
        account_last_failed_attempt: 'account_last_failed_attempt',
        email_address: 'account_username',
        email_verified: 'email_verified',
        email_verification_hash: 'email_verification_hash',
        email_verification_hash_expires: 'email_verification_expires'
      },
      security: {
        hash_password: true,
        hash_salt_factor: 1, // Hash factor reduced to reduce test times
        max_failed_login_attempts: 10,
        reset_attempts_after_minutes: 5,
        lock_account_for_minutes: 30,
        email_verification: true,
        email_verification_expiration_hours: 12
      }
    };
    var user_to_sign_up = {

      username: 'test@test.com',
      password: 'test'

    };
    authr = new Authr(config);
    authr.signUp(user_to_sign_up, function (err, signup) {
      if(err) throw err;
      user = signup;
      done();
    });

  });
  afterEach(function (done) {
    authr.config.Adapter.resetCollection(function (err) {
      if(err) throw err;
      authr = null;
      done();
    });
  });

  it('should verify a user\'s email address', function (done) {
    authr.verifyEmail(user.email_verification_hash, function (err, user) {
      should.not.exist(err);
      done();
    });
  });

});