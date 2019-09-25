/*dependencies: addons::mobile */
Modernizr.addTest( 'touchpad', function() {
    return (
        !Modernizr.mobile &&
        /ipad|android|sch-i800|playbook|xoom|tablet|gt-p1000|gt-p7510|sgh-t849|nexus 7|nexus 10|shw-m180s|a100|dell streak|silk/gi.test(
            navigator.userAgent || navigator.vendor || window.opera
        )
    );
} );
