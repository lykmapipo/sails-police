# TODO'S

## Authenticable
- [x] email and password attributes
- [x] encryptPassword(callback(error,authenticable))
- [x] comparePassword(password,callback)
- [ ] authenticate(credentials,callback)
    - [x] validate credentials
    - [x] findOneByEmail
    - [x] check if authenticable found/exist
    - [x] check if already confirmed/verified
    - [x] check if account locked
    - [x] compare password
    - [x] if password dont match update failedAttempts
    - [x] if password match clear previous attempts
    - [x] track user on successfully signin
- [x] hook authenticate in sails request lifecycle

## Confirmable
- [x] confirmationToken, confirmationTokenExpiryAt, confirmedAt, 
confirmationSentAt attributes

- [x] generateConfirmationToken(callback)
- [x] sendConfirmation(callback)
- [x] confirm(confirmationToken,callback(error,confirmable))
- [x] hook confirmable with sails http request cycle

## Lockable
- [x] failedAttempt, lockedAt, unlockToken, unlockTokenSentAt, 
unlockTokenExpiryAt attributes

- [x] generateLockToken(lockable,callback)
- [x] sendLock(callback)
- [x] lock(callback)
- [x] unlock(token,callback)
- [x] hook lockable into sails request lifecycle

## Recoverable
- [x] recoveryToken, recoveryTokenExpiryAt, recoveryTokenSentAt attributes
- [x] generateRecoveryToken(callback)
- [x] sendRecovery(callback)
- [x] recover(recoveryToken,callback)
- [x] allow recovery request for confirmed account other wise tell user to confirm account first or regenerate confirmation token and signal user to confirm first?
- [x] validate presence of token and password in post recovery
- [x] hook recoverable into sails request lifecycle

## Registerable
- [x] registeredAt and unregisteredAt datetime attributes
- [x] register(subject,callback)
- [x] unregister(callback)
- [x] hook register and unreister in sails request lifecycle

## Trackable
- [x] signInCount, currentSignInAt, currentSignInIpAddress, 
lastSignInAt, lastSignInIpAddress attributes
- [x] track(currentIpAddress,callback(error,trackable))
- [x] hook trackable into sails request lifecycle

## sendEmail (Notification Transport)
- [x] sendEmail(type,authenticable,done)
- [x] add default console transport

## Validations & Error messages
- [ ] allow custom validation error messages defenitions
- [ ] custom error classes

## Documentation
- [ ] creating starter app
- [ ] creating detailing tutorials on how to use sails police

## Controller
- [x] log all errors 
- [ ] log request data
- [x] implement signup
- [x] implement confirm
- [x] implement signin
- [x] implement signout
- [x] implement forgot password
- [ ] Make controller rest aware
- [ ] Use method-override on some of controllers method


## Next
- [ ] last seen at (Seenable)
- [x] change password (Changeable)
- [x] remember me (Rememberable)