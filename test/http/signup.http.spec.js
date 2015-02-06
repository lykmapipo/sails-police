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
                                next(null, cheerio.load(response.text));
                            }
                        ],
                        function(error, $) {
                            if (error) {
                                done(error);
                            } else {
                                expect($('form').attr('action')).to.be.equal('/signup');
                                done()
                            }
                        });

            });
    });

});