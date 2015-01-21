var should = require('chai').should();
var blanket = require('blanket');
var Authr = require('../index.js');

describe('validation module', function () {
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
      },
        custom: {
            org :{
                presence:true,
                unique:true
            },
            username: {
                unique:true
            },
            password:{
                presence:true
            }
        }
    };

    authr = new Authr(config);
      var signup = {
          username: 'test@test.com',
          password:'test',
          org: 'taken'
      };
      authr.signUp(signup, function(err, user){
          if(err) throw err;
          done();
      });
  });
  afterEach(function (done) {
    authr.config.Adapter.resetCollection(function (err) {
      done();
    });
  });

it('should validate when everything is correct', function(done){
    var signup = {
        username:'test',
        password: 'test',
        org: 'required'
    };
    authr.validate(signup, function(err, _signup){
        should.not.exist(err);
        done();
    });
});
    
    it('should not validate when there are errors', function(done){
    var signup = {
        username:'test',
        password: 'test',
        org: 'taken'
    };
    authr.validate(signup, function(err, _signup){
        should.exist(err);
        done();
    });
});

});