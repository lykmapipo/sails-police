var request = require('supertest');
var jsdom = require('jsdom');
var fs = require("fs");
var path = require('path');
var jquery = fs.readFileSync(path.join(__dirname, "jquery.js"), "utf-8");
var async = require('async');
var expect = require('chai').expect;

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
                                jsdom
                                    .env({
                                        html: response.text,
                                        src: [jquery],
                                        done: next
                                    });
                            }
                        ],
                        function(error, window) {
                            if (error) {
                                done(error);
                            } else {
                                var $ = window.$;

                                expect($('form').attr('action')).to.be.equal('/signin');

                                done()
                            }
                        });

            });
    });

});