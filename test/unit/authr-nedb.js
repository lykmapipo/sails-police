var should = require('chai').should();
var blanket = require('blanket');
var Adapter = require('authr-nedb');
var moment = require('moment');
describe('default adapter', function () {
  describe('constructor', function () {
    var adapter;
    var signup_config;
    var authr_config;
    beforeEach(function (done) {
      authr_config = {
        user: {
          username: 'account.username',
          password: 'account.password',
          account_locked: 'account.locked.account_locked',
          account_locked_until: 'account.locked.account_locked_until',
          account_failed_attempts: 'account.locked.account_failed_attempts',
          account_last_failed_attempt: 'account.locked.account_last_failed_attempt',
          email_address: 'account_username',
          email_verified: 'email.email_verified',
          email_verification_hash: 'email.email_verification_hash',
          email_verification_hash_expires: 'email.email_verification_expires'
        },
        db: {
          type: 'nedb',
        },
        security: {
          hash_password: true,
          hash_salt_factor: 1, // salt work factor reduced for testing
          max_failed_login_attempts: 10,
          reset_attempts_after_minutes: 5,
          lock_account_for_minutes: 30,
          email_verification: true,
          email_verification_expiration_hours: 12
        },
        errmsg: {
          username_taken: 'This username is taken Please choose another.',
          token_not_found: 'This signup token does not exist. Please try again.',
          token_expired: 'This token has expired. A new one has been generated.',
          un_and_pw_required: 'A username and password are required to log in.',
          username_not_found: 'Username not found. Please try again or sign up.',
          password_incorrect: 'Password incorrect. Your account will be locked after ##i## more failed attempts.',
          account_locked: 'Too many failed attempts. This account will be locked for ##i## minutes.'
        }

      };

      adapter = new Adapter(authr_config);
      done();

    });

    it('should have the right db config', function (done) {
      adapter.config.db.type.should.equal('nedb');
      done();
    });

    it('should be able to connect to database', function (done) {
      adapter.connect(function (err) {
        should.not.exist(err);
        done();
      });
    });

    it('should have the right database object', function (done) {
      adapter.connect(function (err) {
        should.exist(adapter.db);
        done();
      });
    });

    it('should be able to disconnect from database', function (done) {
      adapter.connect(function (error) {
        adapter.disconnect(function (err) {
          should.not.exist(err);
          done();
        });
      });
    });
  });

  describe('signup', function () {
    var adapter;
    var signup_config;
    var authr_config;
    beforeEach(function (done) {
      authr_config = {
        user: {
          username: 'account.username',
          password: 'account.password',
          password_reset_token: 'account.password_reset_token',
          password_reset_token_expiration: 'account.password_reset_token_expiration',
          account_locked: 'account.locked.account_locked',
          account_locked_until: 'account.locked.account_locked_until',
          account_failed_attempts: 'account.locked.account_failed_attempts',
          account_last_failed_attempt: 'account.locked.account_last_failed_attempt',
          email_address: 'account.username',
          email_verified: 'email.email_verified',
          email_verification_hash: 'email.email_verification_hash',
          email_verification_hash_expires: 'email.email_verification_expires'
        },
        db: {
          type: 'nedb',
        },
        security: {
          hash_password: true,
          hash_salt_factor: 1, // salt work factor reduced for testing
          max_failed_login_attempts: 10,
          reset_attempts_after_minutes: 5,
          lock_account_for_minutes: 30,
          email_verification: true,
          email_verification_expiration_hours: 12
        },
        errmsg: {
          username_taken: 'This username is taken Please choose another.',
          token_not_found: 'This signup token does not exist. Please try again.',
          token_expired: 'This token has expired. A new one has been generated.',
          un_and_pw_required: 'A username and password are required to log in.',
          username_not_found: 'Username not found. Please try again or sign up.',
          password_incorrect: 'Password incorrect. Your account will be locked after ##i## more failed attempts.',
          account_locked: 'Too many failed attempts. This account will be locked for ##i## minutes.'
        }

      };

      signup_config = {
        account: {
          username: 'test@test.com',
          password: 'test'
        }
      };
      adapter = new Adapter(authr_config);
      done();

    });

    describe('utilities', function () {
      it('should be able to get the value of an object using a string indicating its path', function (done) {
        var username = adapter.getVal(signup_config, 'account.username');
        username.should.equal(signup_config.account.username);
        done();
      });

      it('should be able to dynamically build objects for queries using the user key in the authr config', function (done) {
        test_query = {};
        test_query = adapter.buildQuery(test_query, 'account.username', 'test');
        test_query = adapter.buildQuery(test_query, 'account.password', 'test');
        test_query = adapter.buildQuery(test_query, 'email.email_verified', true);
        test_query.account.username.should.equal('test');
        test_query.account.password.should.equal('test');
        test_query.email.email_verified.should.equal(true);
        done();
      });

      it('should be able to hash a password', function (done) {
        adapter.hashPassword(signup_config, signup_config, adapter.config.user.password, function (err, user) {
          should.not.exist(err);
          should.exist(user);
          done();
        });
      });

      it('should be able to generate a verification hash', function (done) {
        adapter.doEmailVerification(signup_config, function (err) {
          should.not.exist(err);
          done();
        });
      });

      it('should return no error when credentials are supplied', function (done) {
        adapter.checkCredentials(signup_config, function (err, user) {
          should.not.exist(err);
          done();
        });

      });
      it('should return no error when credentials are supplied', function (done) {
        signup_config.account.username = null;
        adapter.checkCredentials(signup_config, function (err, user) {
          should.exist(err);
          err.should.equal(adapter.config.errmsg.un_and_pw_required);
          done();
        });

      });

      it('should be able to save users', function (done) {
        adapter.connect(function (err) {
          if(err) {
            throw err;
          }
          adapter.saveUser(signup_config, function (err, user) {
            should.exist(user);
            adapter.disconnect(function () {
              done();
            });
          });
        });
      });
    });
    describe('db operations', function () {
      var saved_user;
      beforeEach(function (done) {
        var user = {
          account: {
            username: 'test@test.com',
            password: 'test'
          }
        };

        adapter.doEmailVerification(user, function (err, user) {
          if(err) {
            throw err;
          }
          adapter.buildAccountSecurity(user);
          adapter.hashPassword(user, user, adapter.config.user.password, function () {
            adapter.saveUser(user, function (err, user) {
              saved_user = user;
              done();
            });
          });
        });

      });

      afterEach(function (done) {
        adapter.resetCollection(function (err) {
          done();
        });
      });
      it('should be able to find duplicate users', function (done) {
        adapter.isValueTaken(saved_user, adapter.config.user.username, function (err, isTaken) {
          isTaken.account.username.should.equal(saved_user.account.username);
          done();
        });
      });
      it('should be able to retreive a verification hash', function (done) {
        adapter.findVerificationToken(saved_user.email.email_verification_hash, function (err, user) {
          should.not.exist(err);
          saved_user.email.email_verification_hash.should.equal(user.email.email_verification_hash);
          done();
        });
      });

      it('should be able to check the expiration date on an a verification hash', function (done) {
        adapter.findVerificationToken(saved_user.email.email_verification_hash, function (err, user) {
          isExpired = adapter.emailVerificationExpired(saved_user);

          isExpired.should.equal(false);
          done();
        });
      });

      it('should be able to mark email_verified as true', function (done) {
        adapter.verifyEmailAddress(saved_user, function (err, user) {
          should.exist(user);
          done();
        });

      });
      
            it('should return true if a password reset token is expired', function(done){
        saved_user.account.password_reset_token_expiration = moment().add(-1, 'hours').toDate();
        adapter.resetTokenExpired(saved_user).should.equal(true);
        done();
      });
      
      it('should return false if a password reset token is not expired', function(done){
        saved_user.account.password_reset_token_expiration = moment().add(12, 'hours').toDate();
        adapter.resetTokenExpired(saved_user).should.equal(false);
        done();
      });
      
      it('should be able to find a user by an email address', function(done){
        adapter.getUserByEmail('test@test.com', function(err, user){
          should.exist(user);
          done();
        });
      });
      it('should return error if email address is not found', function(done){
        adapter.getUserByEmail('test2@test.com', function(err, user){
          should.exist(err);
          done();
        });
      });
      
      it('should return error if username is not found', function(done){
        adapter.getUserByUsername('test2@test.com', function(err, user){
          should.exist(err);
          done();
        });
      });
      
      it('should return false if the account is not locked', function (done) {
        adapter.isValueTaken(saved_user, adapter.config.user.username, function (err, usr) {
          adapter.isAccountLocked(usr, function (err, locked) {
            should.not.exist(err);
            locked.should.equal(false);
            done();
          });
        });
      });
      
            it('should return false if the account is locked but the lock is expired', function (done) {
        adapter.isValueTaken(saved_user, adapter.config.user.username, function (err, usr) {
          usr.account.locked.account_locked = true;
          usr.account.locked.account_locked_until = moment().add(-1, 'hours').toDate();
          adapter.isAccountLocked(usr, function (err, locked) {
            should.not.exist(err);
            locked.should.equal(false);
            done();
          });
        });
      });

      it('should be able to lock an account', function (done) {
        adapter.isValueTaken(saved_user, adapter.config.user.username, function (err, usr) {
          adapter.lockUserAccount(usr, function (err) {
            should.exist(err);
            err.err.should.equal(adapter.config.errmsg.account_locked.replace('##i##', adapter.config.security.lock_account_for_minutes));
            done();
          });
        });
      });
      
it('should be able to check to see if an email address is verified', function(done){
  adapter.isEmailVerified(saved_user).should.equal(false);
  done();
});
      


      it('should be able to unlock an account', function (done) {
        adapter.isValueTaken(saved_user, adapter.config.user.username, function (err, usr) {
          adapter.lockUserAccount(usr, function (err) {
            adapter.unlockUserAccount(usr, function () {
              adapter.user.account.locked.account_locked.should.equal(false);
              done();
            });

          });
        });
      });

      it('should expire failed login attempts', function (done) {
        adapter.isValueTaken(saved_user, adapter.config.user.username, function (err, usr) {
          usr = adapter.buildQuery(usr, adapter.config.user.account_failed_attempts, 4);
          usr = adapter.buildQuery(usr, adapter.config.user.account_last_failed_attempt, moment().add(-1, 'hour').toDate());
          adapter.failedAttemptsExpired(usr, function (err, reset) {
            usr.account.locked.account_failed_attempts.should.equal(0);
            done();
          });
        });
      });

      it('should increment the number of failed attempts after a failed attempt', function (done) {
        adapter.isValueTaken(saved_user, adapter.config.user.username, function (err, usr) {
          adapter.incrementFailedLogins(usr, function () {
            usr.account.locked.account_failed_attempts.should.equal(1);
            done();
          });
        });
      });

      it('should lock an account after the specified number of failed login attempts', function (done) {
        adapter.isValueTaken(saved_user, adapter.config.user.username, function (err, usr) {
          usr = adapter.buildQuery(usr, adapter.config.user.account_failed_attempts, adapter.config.security.max_failed_login_attempts);
          adapter.incrementFailedLogins(usr, function () {
            usr.account.locked.account_locked.should.equal(true);
            done();
          });
        });
      });

      it('should increment the number of failed attempts when a bad password is supplied', function (done) {
        adapter.isValueTaken(saved_user, adapter.config.user.username, function (err, usr) {
          login = {
            account: {
              username: 'test@test.com',
              password: 'not_really_it'
            }
          };
          adapter.comparePassword(usr, login, function (err, doc) {
            should.exist(err);
            err.remaining_attempts.should.equal(9);
            done();
          });
        });
      });

      it('should return null when the password is correct and hashing is on', function (done) {
        adapter.isValueTaken(saved_user, adapter.config.user.username, function (err, usr) {
          login = {
            account: {
              username: 'test@test.com',
              password: 'test'
            }
          };
          adapter.comparePassword(usr, login, function (err, doc) {
            should.not.exist(err);
            done();
          });
        });
      });

      it('should return null when the password is correct and hashing is off', function (done) {
        var user_to_save = {
          account: {
            username: 'test@test.com',
            password: 'test'
          }
        };
        var saved_user;
        adapter.config.security.hash_password = false;

        adapter.doEmailVerification(user_to_save, function (err, user) {
          if(err) {
            throw err;
          }
          adapter.buildAccountSecurity(user);
          adapter.saveUser(user, function (err, user) {
            saved_user = user;
            adapter.comparePassword(saved_user, user_to_save, function (err, user) {
              should.not.exist(err);
              done();
            });

          });
        });

      });

    

      it('should return error when the password is incorrect, hashing is off, and locking is off', function (done) {
        var user_to_save = {
          account: {
            username: 'test@test.com',
            password: 'test'
          }
        };
        var saved_user;
        adapter.config.security.hash_password = false;
        adapter.config.security.max_failed_login_attempts = 0;

        adapter.doEmailVerification(user_to_save, function (err, user) {
          if(err) {
            throw err;
          }
          adapter.buildAccountSecurity(user);
          adapter.saveUser(user, function (err, user) {
            saved_user = user;
            adapter.comparePassword(saved_user, {
              account: {
                username: 'test@test.com',
                password: 'not_really_it'
              }
            }, function (err, user) {
              should.exist(err);
              err.should.equal(adapter.config.errmsg.password_incorrect);
              done();
            });

          });
        });

      });

      it('should be able to save a password reset token', function (done) {
        adapter.getUserByUsername('test@test.com', function (err, user) {
          if(err) throw err;
          adapter.savePWResetToken(user, 'dummytoken', function (err, user) {
            should.exist(user.account.password_reset_token);
            done();
          });
        });
      });

      it('should be able to find a password reset token', function (done) {
        adapter.getUserByUsername('test@test.com', function (err, user) {

          should.not.exist(err);
          adapter.generateToken(20, function (err, token) {

            should.not.exist(err);
            adapter.savePWResetToken(user, token, function (err, user) {

              should.not.exist(err);

              adapter.findResetToken(user.account.password_reset_token, function (err, user) {
                should.not.exist(err);
                done();
              });

            });
          });
        });
      });

      it('should be able to save a new password on password update', function (done) {
        var login = {
          account: {
            username: 'test@test.com',
            password: 'test'
          }
        };
        adapter.isValueTaken(login, 'account.username', function (err, user) {
          adapter.hashPassword(login, user, 'account.password', function (err, user) {
            adapter.resetPassword(user, function (err, usr) {
              should.not.exist(err);
              should.exist(usr);
              done();
            });

          });
        });

      });
      it('should be able to delete a user', function (done) {
        adapter.deleteAccount(saved_user, function (err, user) {
          should.not.exist(err);
          should.exist(user);
          done();
        });

      });
    });
  });
});