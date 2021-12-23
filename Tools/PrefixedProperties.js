

function testPrefix( list, element = 'div' ) {

    const $ELEMENT = document.createElement( element );

    for ( const key of Object.keys( list ) ) {
        if ( key in $ELEMENT.style ) {
            return list[ key ];
        }
    }

    return '';
}


export const animationendEventName = ( function() {
    return testPrefix( {
        "animation":       "animationend",
        "OAnimation":      "oAnimationEnd",
        "MozAnimation":    "animationend",
        "WebkitAnimation": "webkitAnimationEnd"
    } );
} )();


export const transitionendEventName = ( function() {
    return testPrefix( {
        "transition":       "transitionend",
        "OTransition":      "oTransitionEnd",
        "MozTransition":    "transitionend",
        "WebkitTransition": "webkitTransitionEnd"
    } );
} )();


export const transformPropertyName = ( function() {
    return testPrefix( {
        "transform":       "transform",
        "WebkitTransform": "WebkitTransform",
        "OTransform":      "OTransform",
        "MozTransform":    "MozTransform"
    } );
} )();


export const transitionPropertyName = ( function() {
    return testPrefix( {
        "transition":       "transition",
        "WebkitTransition": "WebkitTransition",
        "OTransition":      "OTransition",
        "MozTransition":    "MozTransition"
    } );
} )();
