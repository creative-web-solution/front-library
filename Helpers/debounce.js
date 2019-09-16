/**
 * Debounce
 *
 * @param {Function} callback
 * @param {number} [threshold=100]
 *
 * @example debouncedFunction = debounce( myFunction, 200 )
 *
 * @returns {Function}
 */
export function debounce(callback, threshold = 100) {
    var timer
    return function() {
        clearTimeout(timer)
        var args = [].slice.call(arguments)
        timer = setTimeout(function() {
            callback.apply(this, args)
        }, threshold)
    }
}
