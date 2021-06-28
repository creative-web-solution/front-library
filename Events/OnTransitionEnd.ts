import { transitionendEventName }   from '@creative-web-solution/front-library/Tools/PrefixedProperties';


/**
 * Bind a one time transitionend event on a DOM object
 *
 * @param $element
 *
 * @example
 * onTransitionEnd( $elem ).then( () => {} );
 *
 * @example
 * // To remove the event binding, don't chain .then() directly after onTransitionEnd:
 * let transitionEnd = onTransitionEnd( $element );
 * transitionEnd.then( () => {} );
 *
 * transitionEnd.off()
 *
 * @returns Return a standard Promise + an .off() function to cancel event
 */
export default function onTransitionEnd( $element: Element ): Promise<any> & { off(); } {
    let _resolve;

    const promise = new Promise( function( resolve ) {
        _resolve = resolve;
    } ) as Promise<any> & { off(); };


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
