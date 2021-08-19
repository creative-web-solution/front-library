

function testPrefix( list: { [ key: string ]: string }, element = 'div' ): string {

    const $ELEMENT: HTMLElement = document.createElement( element );

    for ( const key of Object.keys( list ) ) {
        if ( key in $ELEMENT.style ) {
            return list[ key ];
        }
    }

    return '';
}


export const animationendEventName: string = ( function() {
    return testPrefix( {
        "animation":       "animationend",
        "OAnimation":      "oAnimationEnd",
        "MozAnimation":    "animationend",
        "WebkitAnimation": "webkitAnimationEnd"
    } );
} )();


export const transitionendEventName: string = ( function() {
    return testPrefix( {
        "transition":       "transitionend",
        "OTransition":      "oTransitionEnd",
        "MozTransition":    "transitionend",
        "WebkitTransition": "webkitTransitionEnd"
    } );
} )();


export const transformPropertyName: string = ( function() {
    return testPrefix( {
        "transform":       "transform",
        "WebkitTransform": "WebkitTransform",
        "OTransform":      "OTransform",
        "MozTransform":    "MozTransform"
    } );
} )();


export const transitionPropertyName: string = ( function() {
    return testPrefix( {
        "transition":       "transition",
        "WebkitTransition": "WebkitTransition",
        "OTransition":      "OTransition",
        "MozTransition":    "MozTransition"
    } );
} )();
