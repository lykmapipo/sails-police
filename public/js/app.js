(function($) {
    //toastr options
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-center",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

    var error = $('#error');
    var warning = $('#warning');
    var success = $('#success');

    if (error.length) {
        toastr.error(error.html(), "Error");
    }

    if (warning.length) {
        toastr.warning(warning.html(), "Warning");
    }

    if (success.length) {
        toastr.success(success.html(), "Success");
    }

})(jQuery);