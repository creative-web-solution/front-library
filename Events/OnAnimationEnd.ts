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
 * // To watch for a animation end:
 * onAnimationEnd( $elem, {
 * "animationName": "name-of-my-css-animation"
 * } )
 *
 * // To watch a animation end on a pseudo element like "::after":
 * onAnimationEnd( $elem, {
 * "pseudoElement": "after"
 * } )
 *
 * @returns Return a standard Promise + an .off() function to cancel event
 */
export default function onAnimationEnd( $element: Element, options: { pseudoElement?: 'after' | 'before' | 'both', animationName?: string } = {} ): Promise<any> & { off(); } {
    let _resolve;

    const promise = new Promise( function( resolve ) {
        _resolve = resolve;
    } ) as Promise<any> & { off(); };


    function remove() {
        $element.removeEventListener( animationendEventName, onAnimationEnd );
    }


    function onAnimationEnd( e ) {
        if (
            e.target !== $element ||
            ( options.animationName && options.animationName !== e.animationName ) ||
            ( options.pseudoElement === 'after' && e.pseudoElement !== '::after' ) ||
            ( options.pseudoElement === 'before' && e.pseudoElement !== '::before' ) ||
            ( options.pseudoElement === 'both' && !e.pseudoElement ) ||
            ( !options.pseudoElement && e.pseudoElement !== '' )
        ) {
            return;
        }

        remove();

        _resolve( [ e, $element ] );
    }


    $element.addEventListener( animationendEventName, onAnimationEnd, false );

    promise.off = remove;

    return promise;
}
