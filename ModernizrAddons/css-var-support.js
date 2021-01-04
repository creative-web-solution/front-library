Modernizr.addTest( 'cssvars', function() {
    return window.CSS && CSS.supports('color', 'var(--fake-var)');;
} );
