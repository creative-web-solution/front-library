/**
 * Throttle
 *
 * @param {Function} callback
 * @param {Number} [limit=100]
 *
 * @example throttledFunction = throttle( cbFunction, 200 )
 *
 * @returns {Function}
 */
export function throttle( callback, limit = 100 ) {
    let wait = false;

    return function( ...args ) {
        if ( !wait ) {
            wait = true;

            callback.apply( this, args );

            setTimeout( () => {
                wait = false;
            }, limit );
        }
    }
}
