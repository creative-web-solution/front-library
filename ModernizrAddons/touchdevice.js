/*dependencies: addons::mobile,addons::touchpad */
Modernizr.addTest( 'touchdevice', function() {
    return window.matchMedia('(hover: none)').matches;
} );
