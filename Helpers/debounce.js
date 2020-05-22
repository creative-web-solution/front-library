/**
 * Debounce
 *
 * @param {Function} callback
 * @param {Number} [threshold=100]
 * @param {Boolean} [immediate]
 *
 * @example debouncedFunction = debounce( myFunction, 200 )
 *
 * @returns {Function}
 */
export function debounce( callback, threshold = 100, immediate ) {
    let timeout;

    return function() {
        const context = this, args = arguments;

        let later = function() {
            timeout = null;

            if ( !immediate ) {
                callback.apply( context, args );
            }
        };

        let callNow = immediate && !timeout;

        clearTimeout( timeout );

        timeout = setTimeout( later, threshold );

        if ( callNow ) {
            callback.apply( context, args );
        }
    };
}
