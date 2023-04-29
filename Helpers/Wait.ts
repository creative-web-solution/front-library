/**
 * Return a promise and wait for 'waitFor' millisecond to resolve it.
 * If 'waitFor' &lt; 0 =&gt; wait for an animation frame
 *
 * @param waitFor - Number in ms or 'idle'
 *
 * @example
 * // Wait for an animation frame (using requestAnimationFrame)
 * wait().then( ... )
 *
 * @example
 * // Wait for 500ms
 * wait( 500 ).then( ... )
 *
 * @example
 * // Wait for an idle state
 * wait( 'idle' ).then( ... )
 *
 * @example
 * // To be able to cancel the waiting, don't chain .then() directly on wait()
 * promise = wait( 500 )
 * promise.then( ... )
 * promise.off()
 *
 * @returns A promise with a .off() function to cancel the waiting
 */
export function wait( waitFor: number | 'idle' = -1 ): Promise<any> & { off(); } {
    let timeoutId: any, _resolve;


    const promise =  new Promise( function( resolve ) {
        _resolve = resolve;
    } ) as Promise<any> & { off(); };


    if ( waitFor === 'idle' ) {
        timeoutId = window.requestIdleCallback( _resolve );
    }
    else if ( waitFor < 0 ) {
        timeoutId = window.requestAnimationFrame( _resolve );
    }
    else {
        timeoutId = setTimeout( _resolve, waitFor as number );
    }


    promise.off = function() {
        if ( waitFor === 'idle' ) {
            window.cancelIdleCallback( timeoutId );
        }
        else if ( waitFor < 0 ) {
            window.cancelAnimationFrame( timeoutId );
        }
        else {
            clearTimeout( timeoutId );
        }
    };


    return promise;
}
