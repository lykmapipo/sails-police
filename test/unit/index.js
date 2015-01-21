var should = require('chai').should();
var blanket = require('blanket');
var Authr = require('../index.js');

process.setMaxListeners(50);
describe('core module', function(){
  
  describe('missing config', function() {
  var authr;
  beforeEach(function () {
    authr = new Authr();
  });
    afterEach(function(done){
      authr.config.Adapter.resetCollection(function(){
        authr = null;
        done();
      });
    });

  it('use default user config if none is supplied', function () {
    authr.config.user.username.should.equal('username');
  });

  it('should use nedb if no db config is supplied', function () {
    authr.config.db.type.should.equal('nedb');
  });

  it('should save without config', function () {
    var signup = {
      username: 'test@test.com',
      password: 'test'
    };
    authr.signUp(signup, function (doc) {
      should.exist(doc);
      doc.username.should.equal('test@test.com');
    });
  });
});
  
  describe('partial config', function(){
    it('should add missing config options when a partial config file is supplied', function(done){
      authr = new Authr({user:{}, db: {}, security:{}, errmsg:{}});
      done();
    });
  });

describe('signup', function (done) {
  var authr;
  beforeEach(function (done) {
    var config = {
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

  afterEach(function(done){
    authr.config.Adapter.resetCollection(function(){
      authr = null;
      done();
    });
  });

  it('should sign users up', function (done) {
    var signup = {
      username: 'test',
      password: 'test'
    };
    authr.signUp(signup, function (err, user) {
      should.exist(user);
      done();
    });
  });

  it('should add security options if present', function (done) {
    var signup = {
      username: 'test',
      password: 'test'
    };
    authr.signUp(signup, function (err,user) {
      should.exist(user.account_locked);
      done();
    });
  });

  it('should allow for extra fields in the schema', function (done) {
    var signup = {
      username: 'test',
      password: 'test',
      addl: {
        test_field: true
      }
    };
    authr.signUp(signup, function (err, user) {
      should.exist(user.addl.test_field);
      done();
    });
  });

});
});
