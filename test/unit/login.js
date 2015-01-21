var should = require('chai').should();
var blanket = require('blanket');
var Authr = require('../index.js');

describe('login module', function () {
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
      user = signup;
      done();
    });

  });
  afterEach(function(done){
    authr.config.Adapter.resetCollection(function(err){
      authr = null;
      done();
    });
  });
  it('should require a username to log in', function (done) {

    var bad_credentials = {
      username: '',
      password: 'something'
    };
    authr.login(bad_credentials, function (err, user) {

      should.exist(err);
      err.should.equal(authr.config.errmsg.un_and_pw_required);
      done();
    });

  });

  it('should require a password to log in', function (done) {

    var bad_credentials = {
      username: 'something',
      password: ''
    };
    authr.login(bad_credentials, function (err, user) {
      should.exist(err);
      err.should.equal(authr.config.errmsg.un_and_pw_required);
      done();
    });

  });

  it('should return the user if the credentials are correct, the account is unlocked, and the email address is verified', function (done) {
    var good_credentials = {
      username: "test@test.com",
      password: "test"
    };
    authr.verifyEmail(user.email_verification_hash, function (error, usr) {
      authr.login(good_credentials, function (err, user) {
        should.not.exist(err);
        should.exist(user);
        user.username.should.equal('test@test.com');
        done();
      });
    });

  });

  it('should return an error if the email address is not verified', function(done){
    var good_credentials = {
      username: "test@test.com",
      password: "test"
    };
    authr.login(good_credentials, function(err, user){
      should.exist(err);
      err.err.should.equal(authr.config.errmsg.email_address_not_verified);
      done();
    });
  });

  it('should return an error when the user is not found', function (done) {
    var bad_credentials = {
      username: 'not_signed_up@test.com',
      password: 'test'
    };
    authr.login(bad_credentials, function (err, user) {
      should.exist(err);
      err.should.equal(authr.config.errmsg.username_not_found);
      done();
    });
  });

  it('should skip account security checks if they are not enabled', function (done) {
    authr.config.security.max_failed_login_attempts = 0;
    authr.config.security.email_verification = false;
    var good_credentials = {
      username: 'test@test.com',
      password: 'test'
    };
    authr.login(good_credentials, function (err, user) {
      should.not.exist(err);
      done();
    });
  });

});