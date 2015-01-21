var should = require('chai').should();
var blanket = require('blanket');
var Authr = require('../index.js');

describe('password reset module', function () {
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
        email_address: 'email_address',
        email_verified: 'email_verified',
        email_verification_hash: 'email_verification_hash',
        email_verification_hash_expires: 'email_verification_expires',
        password_reset_token: 'password_reset_token',
        password_reset_token_expiration: 'token_expires'
      },
      security: {
        hash_password: true,
        hash_salt_factor: 1, // Hash factor reduced to reduce test times
        password_reset_token_expiration_hours: 1,
        max_failed_login_attempts: 10,
        reset_attempts_after_minutes: 5,
        lock_account_for_minutes: 30,
        email_verification: true,
        email_verification_expiration_hours: 12
      }
    };
    var user_to_sign_up = {

      username: 'test@test.com',
      password: 'test',
      email_address: 'test@test.com'

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
      authr = null;
      done();
    });
  });

  describe('token generation', function () {
    it('should generate a new token when requested and email address is correct', function (done) {
      authr.createPasswordResetToken(user.email_address, function (err, user) {
        should.not.exist(err);
        should.exist(user);
        should.exist(user.password_reset_token);
        done();
      });
    });
    it('should fail when no email address is given', function (done) {
      authr.createPasswordResetToken('', function (err, token) {
        should.exist(err);
        should.not.exist(token);
        done();
      });
    });

    it('should fail when a username is not found', function (done) {
      authr.createPasswordResetToken('not_real', function (err, token) {
        should.exist(err);
        should.not.exist(token);
        err.should.equal(authr.config.errmsg.email_address_not_found);
        done();
      });
    });

  });

  describe('token verification', function () {
    var token;
    beforeEach(function (done) {
      authr.createPasswordResetToken(user.email_address, function (err, _token) {
        if(err) throw err;
        token = _token;
        done();
      });
    });

    it('should verify a correct token', function (done) {
      authr.verifyPasswordResetToken(token.password_reset_token, function (err, user) {
        should.not.exist(err);
        done();
      });
    });

  });
  
  describe('password reset', function(){
      var token;
    beforeEach(function(done){
      authr.createPasswordResetToken(user.email_address, function(err, _token){
          token = _token.password_reset_token;
        if(err) throw err;
        authr.verifyPasswordResetToken(_token.password_reset_token, function(err, user){
          if(err) throw err;
          done();
        });
      });
    });

    it('should reset passwords', function(done){
      authr.updatePassword(token,'password2', function(err, _user){
        should.not.exist(err);
        should.exist(_user);
        done();
      });
    });
  });

});