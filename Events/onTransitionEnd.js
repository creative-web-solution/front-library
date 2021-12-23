import { transitionendEventName }   from '../Tools/PrefixedProperties';


/**
 * Bind a one time transitionend event on a DOM object
 *
 * @example
 * onTransitionEnd( $elem ).then( () =&gt; `{}` );
 *
 * @example
 * ```js
 * // To remove the event binding, don't chain .then() directly after onTransitionEnd:
 * let transitionEnd = onTransitionEnd( $element );
 * transitionEnd.then( () => {} );
 *
 * transitionEnd.off()
 *
 * // To watch for a specific CSS property transition end:
 * onTransitionEnd( $elem, {
 * "property": "opacity"
 * } )
 *
 * // To watch a transition end on a pseudo element like "::after":
 * onTransitionEnd( $elem, {
 * "pseudoElement": "after"
 * } )
 * ```
 *
 * @returns Return a standard Promise + an .off() function to cancel event
 */
export default function onTransitionEnd( $element, options = {} ) {
    let _resolve;

    const promise = new Promise( function( resolve ) {
        _resolve = resolve;
    } );


    function remove() {
        $element.removeEventListener(
            transitionendEventName,
            onTransitionEnd
        );
    }


    function onTransitionEnd( e ) {
        if (
            e.target !== $element ||
            ( options.property && !options.property.includes( e.propertyName ) ) ||
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


    $element.addEventListener(
        transitionendEventName,
        onTransitionEnd,
        false
    );


    promise.off = remove;

    return promise;
}
