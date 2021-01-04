import { defer } from '@creative-web-solution/front-library/Helpers/defer';

/**
 * Return a promise and wait for 'waitFor' millisecond to resolve it.
 * If 'waitFor' < 0 => wait for an animation frame
 *
 * @param {Number|String} [waitFor=-1] - Number in ms or 'idle'
 *
 * @example // Wait for an animation frame (using requestAnimationFrame)
 * wait().then( ... )
 *
 * // Wait for 500ms
 * wait( 500 ).then( ... )
 *
 * // Wait for an idle state
 * wait( 'idle' ).then( ... )
 *
 * // To be able to cancel the waiting, don't chain .then() directly on wait()
 * promise = wait( 500 )
 * promise.then( ... )
 * promise.kill()
 *
 * @returns {Promise} - a promise with a .kill() function to cancel the waiting
 */
export function wait( waitFor = -1 ) {
    let timeoutId;
    let deferred = defer();

    if ( waitFor === 'idle' ) {
        timeoutId = window.requestIdleCallback( deferred.resolve );

        deferred.kill = () => {
            window.cancelIdleCallback( timeoutId );
        };
        return deferred;
    }
    else if ( waitFor < 0 ) {
        timeoutId = window.requestAnimationFrame( deferred.resolve );

        deferred.kill = () => {
            window.cancelAnimationFrame( timeoutId );
        };
        return deferred;
    }

    timeoutId = setTimeout( deferred.resolve, waitFor );

    deferred.kill = () => {
        clearTimeout( timeoutId );
    };

    return deferred;
}
