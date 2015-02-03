# TODO'S

## Authenticable
- [x] email and password attributes
- [x] encryptPassword(callback(error,authenticable))
- [x] comparePassword(password,callback)
- [ ] authenticate(credentials,callback)
    - [ ] validate credentials
    - [x] findOneByEmail
    - [ ] check if authenticable found/exist
    - [ ] check if already confirmed/verified
    - [ ] check if account locked
    - [ ] check fail attempts
    - [x] compare password
    - [ ] if no authenticable found create not found error
- [ ] hook authenticate in sails request lifecycle

## Confirmable
- [x] confirmationToken, confirmationTokenExpiryAt, confirmedAt, 
confirmationSentAt attributes

- [x] generateConfirmationToken(callback)
- [x] sendConfirmation(callback)
- [x] confirm(confirmationToken,callback(error,confirmable))
- [ ] hook confirmable with sails http request cycle

## Lockable
- [x] failedAttempt, lockedAt, unlockToken, unlockTokenSentAt, 
unlockTokenExpiryAt attributes

- [x] generateLockToken(lockable,callback)
- [x] sendLock(callback)
- [x] lock(callback)
- [x] unlock(token,callback)
- [ ] hook lockable into sails request lifecycle

## Recoverable
- [x] recoveryToken, recoveryTokenExpiryAt, recoveryTokenSentAt attributes
- [x] generateRecoveryToken(callback)
- [x] sendRecovery(callback)
- [x] recover(recoveryToken,callback)
- [ ] hook recoverable into sails request lifecycle

## Registerable
- [x] registeredAt and unregisteredAt datetime attributes
- [x] register(subject,callback)
- [x] unregister(callback)
- [ ] hook register and unreister in sails request lifecycle

## Trackable
- [x] signInCount, currentSignInAt, currentSignInIpAddress, 
lastSignInAt, lastSignInIpAddress attributes
- [x] track(currentIpAddress,callback(error,trackable))
- [ ] hook trackable into sails request lifecycle

## Transport (Notification Transport)
- [x] setTransport(transport)
- [x] add default console transport

## Validations & Error messages
- [ ] allow custom validation error messages defenitions
- [ ] custom error classes

## Documentation
- [ ] createing starter app
- [ ] creating detailing tutorials on how to use sails police

## REST
- [ ] Make controller rest aware
- [ ] Use method-override on some of controllers method