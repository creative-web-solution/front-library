import onTransitionEnd    from '../Events/OnTransitionEnd';
import onAnimationEnd     from '../Events/OnAnimationEnd';
import { wait }           from './Wait';


const KEY = Symbol( 'TransitionHelper' );


function addWatcher( $element: HTMLElement, styleChange: ( $element: HTMLElement ) => (Promise<void> | any ), isAnimation: boolean, options: { delay?: 'idle' | number, pseudoElement?: 'after' | 'before' | 'both', properties?: string[], animationName?: string[] } = {} ): Promise<HTMLElement> {
    if ( $element[ KEY ] ) {
        $element[ KEY ].off();
    }

    if ( typeof options.delay !== 'number' && options.delay !== 'idle') {
        options.delay = -1;
    }

    $element[ KEY ] = isAnimation ?
                        onAnimationEnd( $element, {
                            "animationName": options.animationName,
                            "pseudoElement": options.pseudoElement
                        } ) :
                        onTransitionEnd( $element, {
                            "property":      options.properties,
                            "pseudoElement": options.pseudoElement
                        } );

    $element[ KEY ].then( () => {
        $element[ KEY ] = null;
        return $element;
    } );

    wait( options.delay ).then( () => wait() ).then( () => styleChange( $element ) );

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
 * ```ts
 * // Watch for the end of the transition of the property "opacity" on the pseudo element ::after on $element
 *
 * const myWatcher = transitionWatcher( $elment, () =&gt; $element.classList.add('some-class'), {
 *  "pseudoElement": "after",
 *  "property":     "opacity"
 * } );
 * ```
 */
export function transitionWatcher( $element: HTMLElement, styleChange: ( $element: HTMLElement ) => (Promise<void> | any ), options?: { delay?: 'idle' | number, pseudoElement?: 'after' | 'before' | 'both', properties?: string[], animationName?: string[] } ): Promise<HTMLElement> {
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
 * ```ts
 * //Watch for the end of the animation "my-animation" on the pseudo element ::after on $element
 *
 * const myWatcher = animationWatcher( $elment, () =&gt; $element.classList.add('some-class'), {
 *  "pseudoElement": "after",
 *  "animationName": ["my-animation"]
 * } );
 * ```
 */
 export function animationWatcher( $element: HTMLElement, animationStart: ( $element: HTMLElement ) => (Promise<void> | any ), options?: { delay?: 'idle' | number, pseudoElement?: 'after' | 'before' | 'both', animationName?: string[] } ): Promise<HTMLElement> {
    return addWatcher( $element, animationStart, true, options );
}


/**
 * @example Kill a transition or animation watcher on $element
 *
 * killWatcher( $elment )
 */
export function killWatcher( $element: HTMLElement ): void {
    if ( $element[ KEY ] ) {
        $element[ KEY ].off();
        $element[ KEY ] = null;
    }
}
