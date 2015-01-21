var should = require('chai').should();
var blanket = require('blanket');
var Authr = require('../index.js');

describe('signup module', function () {
  var authr;
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

    authr = new Authr(config);
    done();
  });
  afterEach(function (done) {
    authr.config.Adapter.resetCollection(function (err) {
      authr = null;
      done();
    });
  });

  it('should return an error if no username or password are supplied', function (done) {
    var signup = {
      username: '',
      password: ''
    };
    authr.signUp(signup, function (err, user) {
      should.exist(err);
      err.should.equal(authr.config.errmsg.un_and_pw_required);
      done();
    });
  });

  it('should return the user object if everything is successful', function (done) {
    var signup = {
      username: 'test@test.com',
      password: 'test'
    };

    authr.signUp(signup, function (err, user) {
      should.not.exist(err);
      should.exist(user);
      user.username.should.equal(signup.username);
      done();
    });
  });

  it('should not hash the password if hashing is disabled', function (done) {
    var signup = {
      username: 'test@test.com',
      password: 'test'
    };
    authr.config.security.hash_password = false;
    authr.signUp(signup, function(err, user){
      should.not.exist(err);
      should.exist(user);
      user.password.should.equal('test');
      done();
    });
  });

  it('should not generate a signup token of not enabled', function(done){
    var signup = {
      username: 'test@test.com',
      password: 'test'
    };
    authr.config.security.email_verification = false;
    authr.signUp(signup, function(err, user){
      should.not.exist(err);
      should.exist(user);
      should.not.exist(user.email_verified);
      done();
    });
  });

    it('should give an error when the username is already taken', function (done) {
    var signup = {
      username: 'test@test.com',
      password: 'test'
    };
    authr.signUp(signup, function(err, user){
      authr.signUp(signup, function(err, user){
        should.exist(err);
        err.should.equal(authr.config.errmsg.username_taken);
        done();
      });
    });
  });

});