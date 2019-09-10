Modernizr.addTest('ios', function() {
    return /iphone|ipad|ipod/gi.test(
        navigator.userAgent || navigator.vendor || window.opera
    );
});
