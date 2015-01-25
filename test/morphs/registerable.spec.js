var expect = require('chai').expect;

describe('Registerable', function() {
    it('should have registerable static flag', function(done) {
        expect(User.registerable).to.be.true;
        done();
    });

    it('should do have registerable attributes', function(done) {
        expect(User._attributes.registeredAt).to.exist;
        done();
    });


    it('should do have register function', function(done) {
        expect(User.register).to.be.a("function");
        done();
    });

    it('should do be able to register new registerable', function(done) {
        var user = {
            email: 'user@example.com',
            password: 'password'
        }

        User
            .register(user, function(error, registerable) {
                if (error) {
                    console.log(error);
                    done(error);
                } else {
                    console.log(registerable);
                    expect(registerable.id).to.exist;
                    done();
                }
            });
    });
});