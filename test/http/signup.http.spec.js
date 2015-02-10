var request = require('supertest');
var async = require('async');
var expect = require('chai').expect;
var cheerio = require('cheerio');

describe('AuthController#signup', function() {

    it('should respond to http#get on /signup', function(done) {
        request(sails.hooks.http.app)
            .get('/signup')
            .set('Accept', 'text/html')
            .end(function(error, response) {
                async
                    .waterfall(
                        [
                            function(next) {
                                if (error) {
                                    next(error);
                                } else {
                                    next(null, response);
                                }
                            },
                            function(response, next) {
                                next(null, cheerio.load(response.text), response);
                            }
                        ],
                        function(error, $, response) {
                            if (error) {
                                done(error);
                            } else {
                                expect(response.status).to.equal(200);
                                expect(response.ok).to.be.true;
                                expect(response.type).to.equal('text/html');

                                var form = $('form');
                                expect(form.attr('action')).to.be.equal('/signup');
                                expect(form.attr('method')).to.be.equal('POST');

                                done()
                            }
                        });

            });
    });

});