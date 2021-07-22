import { animationendEventName } from '../Tools/PrefixedProperties';


/**
 * Bind a one time animationend event on a DOM object
 *
 * @param $elem
 *
 * @example
 * onAnimationEnd( $elem ).then( () => {} );
 *
 * @example
 * // To remove the event binding, don't chain .then() directly after onAnimationEnd:
 * let animationEnd = onAnimationEnd( $element );
 * animationEnd.then( () => {} );
 *
 * animationEnd.off()
 *
 * @returns Return a standard Promise + an .off() function to cancel event
 */
export default function onAnimationEnd( $element: Element ): Promise<any> & { off(); } {
    let _resolve;

    const promise = new Promise( function( resolve ) {
        _resolve = resolve;
    } ) as Promise<any> & { off(); };


    function remove() {
        $element.removeEventListener( animationendEventName, onAnimationEnd );
    }


    function onAnimationEnd( e ) {
        if ( e.target !== $element ) {
            return;
        }

        remove();

        _resolve( [ e, $element ] );
    }


    $element.addEventListener( animationendEventName, onAnimationEnd, false );

    promise.off = remove;

    return promise;
}
