var request = require('supertest');

describe('Auth#index', function() {
    it('should respond to http#get auth/index', function(done) {
        request(sails.hooks.http.app)
            .get('/auth/index')
            .set('Accept', 'text/html')
            .expect('Content-Type', 'text/html; charset=utf-8')
            .expect(200, done);
    });
});