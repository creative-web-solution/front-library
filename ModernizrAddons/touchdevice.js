/*dependencies: addons::mobile,addons::touchpad */
Modernizr.addTest( 'touchdevice', function() {
    return Modernizr.mobile || Modernizr.touchpad;
} );
