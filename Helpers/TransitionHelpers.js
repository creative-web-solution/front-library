import onTransitionEnd    from '../Events/onTransitionEnd';
import onAnimationEnd     from '../Events/onAnimationEnd';
import { wait }           from './wait';


const KEY = Symbol( 'TransitionHelper' );


function addWatcher( $element, styleChange, isAnimation, options = {} ) {
    if ( $element[ KEY ] ) {
        $element[ KEY ].off();
    }

    if ( typeof options.delay !== undefined ) {
        options.delay = 'idle'
    }

    $element[ KEY ] = isAnimation ?
                        onAnimationEnd( $element, {
                            "animationName": options.animationName,
                            "pseudoElement": options.pseudoElement
                        } ) :
                        onTransitionEnd( $element, {
                            "property":      options.property,
                            "pseudoElement": options.pseudoElement
                        } );

    wait( options.delay ).then( () => styleChange( $element ) );

    $element[ KEY ].then( () => {
        $element[ KEY ] = null;
        return $element;
    } );

    return $element[ KEY ];
}


/**
 * @param styleChange - Change the style of $element inside this function by adding a class or set a style property
 * @param delay - Delay betwwen the add of the listener and call of styleChange.
 *
 * delay = 'idle' : window.requestIdleCallback
 * delay &lt; 0 : window.requestAnimationFrame
 * delay &gt;= 0 : setTimeout
 *
 * @example
 * ```js
 * // Watch for the end of the transition of the property "opacity" on the pseudo element ::after on $element
 *
 * const myWatcher = transitionWatcher( $elment, () =&gt; $element.classList.add('some-class'), {
 *  "pseudoElement": "after",
 *  "property":     "opacity"
 * } );
 * ```
 */
export function transitionWatcher( $element, styleChange, options ) {
    return addWatcher( $element, styleChange, false, options );
}


/**
 * @param animationStart - Start the animation of $element inside this function by adding a class or set a style property
 * @param delay - Delay betwwen the add of the listener and call of animationStart.
 *
 * delay = 'idle' : window.requestIdleCallback
 * delay &lt; 0 : window.requestAnimationFrame
 * delay &gt;= 0 : setTimeout
 *
 * @example
 * ```js
 * //Watch for the end of the animation "my-animation" on the pseudo element ::after on $element
 *
 * const myWatcher = animationWatcher( $elment, () =&gt; $element.classList.add('some-class'), {
 *  "pseudoElement": "after",
 *  "animationName": ["my-animation"]
 * } );
 * ```
 */
 export function animationWatcher( $element, animationStart, options ) {
    return addWatcher( $element, animationStart, true, options );
}


/**
 * @example Kill a transition or animation watcher on $element
 *
 * killWatcher( $elment )
 */
export function killWatcher( $element ) {
    if ( $element[ KEY ] ) {
        $element[ KEY ].off();
        $element[ KEY ] = null;
    }
}
