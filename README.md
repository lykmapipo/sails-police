sails-police(development)
=========================
[![Build Status](https://travis-ci.org/lykmapipo/sails-police.svg?branch=master)](https://travis-ci.org/lykmapipo/sails-police)

Simple and flexible authentication workflows for sails inspired by 
[devise](https://github.com/plataformatec/devise) and [passportjs](https://github.com/jaredhanson/passport).

## Install

```sh
$ npm install sails-police
```

## Usage
`sails-police` expose a single `mixin` function that accept a `model` 
and return a `extended model` with all `sails-police morphs` applied.

Before hand, you have to choose a model that will be used for `sails-police`, 
which is `User` most of the time. After choosing the `sails-police` model 
your have to mix `sails-police` into it. 

```js
//require sails-police
var police = require('sails-police');

//the model
var User = {};

//mixin sails-police
police.mixin(User);

module.exports = User;
```

Modules
========

## [Authenticable](https://github.com/lykmapipo/sails-police/blob/master/lib/morphs/authenticable.js)
It lays down the infrastructure for authenticating a user in `sails-police` application. It extend model supplied to it with the following:

- `email` : An attribute used to store user email address. `sails-police` 
opt to use email address but in future we will add support to custom attribute.

- `password` : An attribute which is used to store user pasword hash.

- `encryptPassword(callback(error,authenticable))` : An instance method 
which encrypt the current model instance password using [bcryptjs](https://github.com/dcodeIO/bcrypt.js).

Example

```js
var faker = require('faker');
var password = faker.internet.password();

//create new user instance
var user = User.new({
    password: password
});

//encypt instance password
user
    .encryptPassword(function(error, authenticable) {
        if (error) {
            console.log(error);
        } else {
 			console.log(authenticable);
        }
    });
```

- `comparePassword(password, callback(error,authenticable))` : An instance 
method which takes in a `password` and compare with the instance password 
hash to see if they match.

Example

```js
var faker = require('faker');
var password = faker.internet.password();

//after having model instance
user
    .comparePassword(password,function(error, authenticable) {
        if (error) {
            console.log(error);
        } else {
            console.log(authenticable);
        }
});
```

- `authenticate(credentials, callback(error,authenticable))` : A model 
static method which takes in credentials in the format of : 

```js
var faker = require('faker');
var credentials = {
            email: faker.internet.email(),
            password: faker.internet.password()
        };
```
where `email` is valid email and `password` is valid password of 
already registered user. It will then authenticate the given credentials. If they are valid credential a user with the supplied credentials will be returned otherwise corresponding errors will be returned.

Example

```js
var faker = require('faker');

//you may obtain this credentials from anywhere
//this is just a demostration for how credential must
var credentials = {
            email: faker.internet.email(),
            password: faker.internet.password()
        };

User
    .authenticate(function(error, authenticable) {
            if (error) {
                console.log(error);
            } else {
                console.log(authenticable);
            }
    });
```

## [Confirmable](https://github.com/lykmapipo/sails-police/blob/master/lib/morphs/confirmable.js)
Provide a means to confirm user registration. It extend model with the following:

- `confirmationToken` : An attribute which used to store current user 
confirmation token.

- `confirmationTokenExpiryAt` : An attribute that keep tracks of when 
the confirmation token will expiry. Beyond that, new confirmation token will be generated and notification will be send.

- `confirmedAt` : An attribute that keep tracks of when user account is confrimed.

- `confirmationSentAt` : An attribute that keep tracks of when confirmation request is sent.

- `generateConfirmationToken(callback(error,confirmable))` : This instance method will generate `confirmationToken` and `confirmationTokenExpiryAt` time. It also update and persist an instance before return it.

Example
```js
var user = User.new();

user
    .generateConfirmationToken(function(error, confirmable) {
        if (error) {
            console.log(error);
        } else {
           console.log(confirmable);
        }
    })
```

- `sendConfirmation(callback(error,confirmable))` : This instance method utilize the configured transport and send the confirmation notification. On successfully send it will update `confirmationSentAt` instance attribute with the current time stamp and persist the instance before return it.
####Note: send confirmation use the transport api provide on [setTranport](#How to implement a transport) configuration.

Example
```js
 var user = User.new({
            email: faker.internet.email(),
            password: faker.internet.password()
        });

user
    .sendConfirmation(function(error, confirmable) {
        if (error) {
            consle.log(error);
        } else {
           consle.log(confirmable);
        }
    });
```

- `confirm(confirmationToken, callback(error,confirmable))` : This 
static/class method taken the given `confirmationToken` and confirm 
any un confirmed registration found with that confirmation token. It 
will update `confirmedAt` instance attribute and persist the instance 
before return it.

Example
```js
 User
    .confirm('confirmationToken',function(error, confirmable) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(confirmable);
                }
       		});
```

## [Lockable](https://github.com/lykmapipo/sails-police/blob/master/lib/morphs/lockable.js)
Provide a mean of locks an account after a specified number of failed sign-in attempts(Defaults to 5 attempts). Can unlock account through unlock instructions sent. It extend the model with the following:

- `failedAttempt` : 
- `lockedAt` : 
- `unlockedAt` :
- `unlockToken` :
- `unlockTokenSentAt` :
- `unlockTokenExpiryAt` :
- `generateUnlockToken(callback(error,lockable))` : 
- `sendLock(callback(error,lockable))` : 
- `lock(callback(error,lockable))` : An instance method that used to lock an account. when called it will check if the number of `failedAttempts` is greater that the configured maximum login attempts, if so the account will get locked by setting `lockedAt` to the current timestamp of `lock` invocation. Instance will get persisted before returned otherwise corresponding errors will get returned.

Example
```js
var faker = require('faker');
var user = User.new({
            email: faker.internet.email(),
            password: faker.internet.password(),
            failedAttempt: 5
        });

user
    .lock(function(error, lockable) {
        if (error) {
            console.log(error);
        } else {
            console.log(lockable);
        }
    });
```

- `unlock(unlockToken, callback(error,lockable))` : A model static method which unlock a locked account with the provided `unlockToken`. If the token expired the new `unlockToken` will get generated. If token is valid, locked account will get unlocked and `unlockedAt` attribute will be set to current timestamp and `failedAttempts` will get set to 0. Instance unlcoked will get persisted before returned otherwise corrensponding errors will get returned.

Example
```js
User
    .unlock(unlockToken,
       function(error, lockable) {
            if (error) {
                console.log(error);
            } else {
                  console.log(lockable);
            }
    });
```

## [Recoverable](https://github.com/lykmapipo/sails-police/blob/master/lib/morphs/recoverable.js)
resets the user password and sends reset instructions.

## [Registerable](https://github.com/lykmapipo/sails-police/blob/master/lib/morphs/registerable.js)
handles signing up users through a registration process, also allowing them to edit and destroy their account.

## [Trackable](https://github.com/lykmapipo/sails-police/blob/master/lib/morphs/trackable.js)
Provide a means of tracking user signin activities. It extend provided 
model with the followings:

- `signInCount` : Keeps track of number of count a user have been sign 
in into you API

- `currentSignInAt` : Keeps track of the latest time when user signed 
in into you API

- `currentSignInIpAddress` : Keeps track of the latest IP address a 
user used to log with into your API

- `lastSignInAt` : Keeps track of the previous sign in time prior to 
the current sign in.

- `lastSignInIpAddress` : Keeps track of the previous IP address 
user used to log with into your API

- `track(ipAddress,callback(error,trackable))` : This is model instance 
method, which when called with the IP address, it will update current 
tracking details and set the provided IP address as the 
`currentSignInIpAddress`. On successfully tracking, a provided `callback` 
will be get invoked and provided with error if occur and the current 
updated model instance.

Example
```js
User
    .findOneByEmail('validEmail')
    .exec(function(error,user){
    	if(error){
	   		console.log(error);
	   	}
	   	else{
	    	user
	    		.track('validIpAddress',function(error,trackable){
				    if(error){
				    	console.log(error);
				    }
				    else{
				    	console.log(trackable);
					}
	    		});
    	}
    });
``` 

## Transport API
By default sails-police default transport is `noop`. This is because 
there are different use case when it came on sending notification. Example 
you may opt to send you notification through sms, email or any other medium 
of your choice.

Due to that reason sails-police has the method `setTransport` which accept 
a function and pass the `type,authentication,done` as it argurments

- `type` : Refer to the type of notifcation to be sent
- `authenticable` : Refer to the model instance that you have mixin 
police morphs

- `done` : Is the callback that you must call after finish sending 
the notification. By default this callback will update notification 
send details based on the usage.

## How to implement a transport
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
### Transport Issues
It is recommended to use job queue like [kue](https://github.com/learnboost/kue) 
when implementing your transport to reduce your API response time.


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
- [ ] custome error classes