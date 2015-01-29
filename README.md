sails-police
=============
Simple and flexible authentication workflows for sails inspired by [devise](https://github.com/plataformatec/devise)

It composed of the following modules:

* [Authenticable](https://github.com/lykmapipo/sails-police/blob/master/lib/morphs/authenticable.js): encrypts and stores a password in the database to validate the authenticity of a user while signing in. The authentication can be done through POST request.
* [Confirmable](https://github.com/lykmapipo/sails-police/blob/master/lib/morphs/confirmable.js): sends emails with confirmation instructions and verifies whether an account is already confirmed during sign in.
* [Lockable](https://github.com/lykmapipo/sails-police/blob/master/lib/morphs/lockable.js): locks an account after a specified number of failed sign-in attempts. Can unlock via email or after a specified time period.
* [Recoverable](https://github.com/lykmapipo/sails-police/blob/master/lib/morphs/recoverable.js): resets the user password and sends reset instructions.
* [Registerable](https://github.com/lykmapipo/sails-police/blob/master/lib/morphs/registerable.js): handles signing up users through a registration process, also allowing them to edit and destroy their account.
* [Trackable](https://github.com/lykmapipo/sails-police/blob/master/lib/morphs/trackable.js): tracks sign in count, timestamps and IP address.


#NOTE
Its under development no release yet.


##Authenticable
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

##Confirmable
- [x] confirmationToken, confirmationTokenExpiryAt, confirmedAt, confirmationSentAt attributes
- [x] generateConfirmationToken(callback)
- [x] sendConfirmation(callback)
- [ ] resendConfirmation(callback)
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
- [x] signInCount, currentSignInAt, currentSignInIpAddress, 
		lastSignInAt, lastSignInIpAddress attributes
- [ ] track(currentIpAddress,callback)

##Transport (Notification Transport)
- [x] setTransport(transport)
- [x] add default console transport

#Transport API
By default sails-police default transport is `console.log`. This is because 
there are different use case when it came on sending notification. Example 
you may opt to send you notification through sms, email or any other medium 
of your choice.

Due to that reason sails-police has the method `setTransport` which accept 
a function and pass the `type,authentication,done` as it argurments

- `type` : Refer to the type of notifcation to be sent
- `authenticable` : Refer to the model instance that you have mixin police morphs
- `done` : Is the callback that you must call after finish sending the notification.
		 By default this callback will update notification send details based on the
		 usage.

##How to implement a transport
Simple and clear way to register a transport is to call `setTrasport(fn)` of 
sails-police and pass in your transport `function`. It is recommended to implement 
all your notification send scenario(s) within that function i.e if you are 
suppose to send both email and sms just implement them together in that single function.

```js
var police = require('sails-police');

//define your transport
//you may store this in sails services 
//and register it on bootstrap.js
var transport = function(type, authenticable, done) {
				//your transport implementation
		        console
		            .log(
		                'Notification type: %s.\nAuthenticable: %s \n',
		                type,
		                JSON.stringify(authenticable)
		            );

		        done();
    };

//then set the transport
police.setTransport(transport);
```
##Transport Issues
It is recommended to use job queue like [kue](https://github.com/learnboost/kue) 
when implementing your transport to reduce your API response time.