module.exports = {
    index: function(request, response) {
        response
            .view('home/index', {
                title: 'Home'
            });
    }
}