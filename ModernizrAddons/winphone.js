Modernizr.addTest('winphone', function() {
    return /Windows Phone/gi.test(
        navigator.userAgent || navigator.vendor || window.opera
    );
});
