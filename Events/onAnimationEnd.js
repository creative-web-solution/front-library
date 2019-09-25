import { defer } from 'front-library/Helpers/defer';

const animationendEventName = ( function() {
    let el, animation;

    el = document.createElement( 'fakeelement' );

    animation = {
        "animation": "animationend",
        "OAnimation": "oAnimationEnd",
        "MozAnimation": "animationend",
        "WebkitAnimation": "webkitAnimationEnd"
    };

    for ( let t in animation ) {
        if ( el.style[ t ] !== undefined ) {
            return animation[ t ];
        }
    }
} )();


/**
 * Bind a one time animationend event on a DOM object
 * @function onAnimationEnd
 *
 * @param {HTMLElement} $elem
 *
 * @example onAnimationEnd( $elem ).then( () => {} );
 *
 * // To remove the event binding, don't chain .then() directly after onAnimationEnd:
 * let animationEnd = onAnimationEnd( $element );
 * animationEnd.then( () => {} );
 *
 * animationEnd.off()
 *
 * @returns {Promise} - Return a standard Promise + an .off() function to cancel event
 */
export function onAnimationEnd( $elem ) {
    let deferred = defer();

    function remove() {
        $elem.removeEventListener( animationendEventName, onAnimationEnd );
    }

    function onAnimationEnd( e ) {
        if ( e.target !== $elem ) {
            return;
        }

        remove();

        deferred.resolve();
    }

    $elem.addEventListener( animationendEventName, onAnimationEnd, false );

    deferred.off = remove;

    return deferred;
}
