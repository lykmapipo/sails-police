var request = require('supertest');
var async = require('async');
var expect = require('chai').expect;
var cheerio = require('cheerio');

describe('AuthController#signin', function() {

    it('should respond to http#get on /signin', function(done) {
        request(sails.hooks.http.app)
            .get('/signin')
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
                                next(null, cheerio.load(response.text));
                            }
                        ],
                        function(error, $) {
                            if (error) {
                                done(error);
                            } else {
                            	var form = $('form');
                                expect(form.attr('action')).to.be.equal('/signin');
                                expect(form.attr('method')).to.be.equal('POST');
                                done()
                            }
                        });

            });
    });

});