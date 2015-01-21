var should = require('chai').should();
var blanket = require('blanket');
var Authr = require('../index.js');

describe('delete account module', function(){
   var authr;
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

    user = {
      username: 'test@test.com',
      password: 'test'
    };

    authr = new Authr(config);
    authr.signUp(user, function(err, user){
      if(err) throw err;
      done();
    });
  });
  afterEach(function (done) {
    authr.config.Adapter.resetCollection(function (err) {
      authr = null;
      done();
    });
  });

  it('should return an error if username and/or password are missing', function(done){
    authr.deleteAccount({username:'', password:''}, function(err, user){
      should.exist(err);
      err.should.equal(authr.config.errmsg.un_and_pw_required);
      done();
    });
  });
  
    it('should return an error if username is not found', function(done){
      var login = {username:'test', password:'test'};
    authr.deleteAccount(login, function(err, user){
      should.exist(err);
      err.should.equal(authr.config.errmsg.username_not_found);
      done();
    });
  });
  
      it('should return an error if password is incorrect', function(done){
        var login = {username:'test@test.com', password:'test2'};
    authr.deleteAccount(login, function(err, user){
      should.exist(err);
      err.err.should.equal(authr.config.errmsg.password_incorrect.replace('##i##', authr.config.security.max_failed_login_attempts-1));
      done();
    });
  });
  
      it('should delete an account if username and password are correct', function(done){
        var login = {username:'test@test.com', password:'test'};
    authr.deleteAccount(login, function(err, usr){
      should.not.exist(err);
      should.exist(usr);
      done();
    });
  });
});