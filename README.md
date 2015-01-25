sails-police
=============
Simple and flexible authentication workflows for sails inspired by [devise]()

It composed of the following modules:

* [Authenticable](): encrypts and stores a password in the database to validate the authenticity of a user while signing in. The authentication can be done through POST request.
* [Confirmable](): sends emails with confirmation instructions and verifies whether an account is already confirmed during sign in.
* [Lockable](): locks an account after a specified number of failed sign-in attempts. Can unlock via email or after a specified time period.
* [Recoverable](): resets the user password and sends reset instructions.
* [Registerable](): handles signing up users through a registration process, also allowing them to edit and destroy their account.
* [Trackable](): tracks sign in count, timestamps and IP address.

#NOTE
Its under development no release yet.

#TODO
- [ ] Adding security layer