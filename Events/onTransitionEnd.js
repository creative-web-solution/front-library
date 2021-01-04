import { defer } from '@creative-web-solution/front-library/Helpers/defer';


const transitionendEventName = ( function() {
    let el = document.createElement( 'fakeelement' );
    let transitions = {
        "transition": "transitionend",
        "OTransition": "oTransitionEnd",
        "MozTransition": "transitionend",
        "WebkitTransition": "webkitTransitionEnd"
    };

    for ( let t in transitions ) {
        if ( typeof el.style[ t ] !== 'undefined' ) {
            return transitions[ t ];
        }
    }
} )();


/**
 * Bind a one time transitionend event on a DOM object
 * @function onTransitionEnd
 *
 * @param {HTMLElement} $element
 *
 * @example onTransitionEnd( $elem ).then( () => {} );
 *
 * // To remove the event binding, don't chain .then() directly after onTransitionEnd:
 * let transitionEnd = onTransitionEnd( $element );
 * transitionEnd.then( () => {} );
 *
 * transitionEnd.off()
 *
 * @returns {Promise} - Return a standard Promise + an .off() function to cancel event
 */
export function onTransitionEnd( $element ) {
    let deferred = defer();

    function remove() {
        $element.removeEventListener(
            transitionendEventName,
            onTransitionEnd
        );
    }

    function onTransitionEnd( e ) {
        if ( e.target !== $element ) {
            return;
        }

        remove();

        deferred.resolve();
    }

    $element.addEventListener(
        transitionendEventName,
        onTransitionEnd,
        false
    );

    deferred.off = remove;

    return deferred;
}
