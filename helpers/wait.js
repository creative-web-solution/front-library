/*dependencies: helpers::defer */
import { defer } from 'front-library/helpers/defer';

/**
 * Return a promise and wait for 'waitFor' millisecond to resolve it.
 * If 'waitFor' < 0 => wait for an animation frame
 *
 * @param {number} [waitFor=-1] - In ms
 *
 * @example // Wait for an animation frame (using requestAnimationFrame)
 * wait().then( ... )
 *
 * // Wait for 500ms
 * wait( 500 ).then( ... )
 *
 * // To be able to cancel the waiting, don't chain .then() directly on wait()
 * promise = wait( 500 )
 * promise.then( ... )
 * promise.kill()
 *
 * @returns {Promise} - a promise with a .kill() function to cancel the waiting
 */
export function wait(waitFor = -1) {
    let timeoutId;
    let deferred = defer();

    if (waitFor < 0) {
        timeoutId = window.requestAnimationFrame(deferred.resolve);

        deferred.kill = () => {
            window.cancelAnimationFrame(timeoutId);
        };
        return deferred;
    }

    timeoutId = setTimeout(deferred.resolve, waitFor);

    deferred.kill = () => {
        clearTimeout(timeoutId);
    };

    return deferred;
}
