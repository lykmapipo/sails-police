module.exports = {
    getSignin: function(request, response) {
        // save redirect url
        var suffix = request.query.redirect ? '?redirect=' + request.query.redirect : '';

        // render view
        response.view('auth/signin', {
            title: 'Signin',
            error: '',
            login: '',
            action: sails.config.devise.login.route + suffix || '/login'
        });
    }
}