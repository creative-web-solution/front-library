Modernizr.addTest('android', function() {
    return /android/gi.test(
        navigator.userAgent || navigator.vendor || window.opera
    );
});
