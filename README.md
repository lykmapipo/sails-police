sails-police
=============
Simple and flexible authentication workflows for sails inspired by [devise](https://github.com/plataformatec/devise)

It composed of the following modules:

* [Authenticable](): encrypts and stores a password in the database to validate the authenticity of a user while signing in. The authentication can be done through POST request.
* [Confirmable](): sends emails with confirmation instructions and verifies whether an account is already confirmed during sign in.
* [Lockable](): locks an account after a specified number of failed sign-in attempts. Can unlock via email or after a specified time period.
* [Recoverable](): resets the user password and sends reset instructions.
* [Registerable](): handles signing up users through a registration process, also allowing them to edit and destroy their account.
* [Trackable](): tracks sign in count, timestamps and IP address.


#NOTE
Its under development no release yet.


##Authenticable
- [x] email and password attributes
- [x] encryptPassword(callback(error,authenticable))
- [x] comparePassword(password,callback)
- [ ] authenticate(authenticable,callback)

##Confirmable
- [x] confirmationToken, confirmationTokenExpiryAt, confirmedAt, confirmationSentAt attributes
- [x] generateConfirmationToken(callback)
- [x] sendConfirmation(callback)
- [ ] confirm(confirmationToken,callback)
- [ ] beforeConfirm(confirmable,callback)
- [ ] afterConfirmable(confirmable,callback)

##Lockable
- [x] failedAttempt, lockedAt, unlockToken, unlockTokenSentAt, unlockTokenExpiryAt attributes
- [ ] generateLockingToken(lockable,callback)
- [ ] lock(criteria,callback)
- [ ] unlock(token,callback)
- [ ] beforeLock(lockable,callback)
- [ ] afterLock(lockable,callback)

##Recoverable
- [x] recoveryToken, recoveryTokenExpiryAt, recoveryTokenSentAt attributes
- [ ] generateRecoveryToken(recoverable,callback)
- [ ] sendRecovery(recoverable,callback)
- [ ] recover(recoveryToken,callback)
- [ ] beforeRecovery(recoverable,callback)
- [ ] afterRecovery(recoverable,callback)

##Registerable
- [x] registeredAt and unregisteredAt datetime attributes
- [x] register(subject,callback)
- [x] unregister(callback)
- [ ] beforeRegister(registerable,done)
- [ ] afterRegister(registerable,done)
- [ ] beforeUnregister(registerable,done)
- [ ] afterUnregister(registerable,done)
- [ ] generateUnregisterToken(registerable,callback)

##Trackable
- [x] signInCount, currentSignInAt, currentSignInIpAddress, lastSignInAt, lastSignInIpAddress attributes
- [ ] track(trackable,callback)
- [ ] track(callback)
- [ ] track(criteria,callback)

##Transport
- [ ] send(authentication,callback)