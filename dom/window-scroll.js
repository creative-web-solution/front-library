/**
 * @typedef {object} windowScroll_Object
 * @property {number} top
 * @property {number} left
 */
/**
 * Get the scroll position of the window
 *
 * @example {top, left} = scroll()
 *
 * @returns {windowScroll_Object} - the position of the scroll
 */
export function scroll() {
    let sx, sy, d, r, b

    if (window.pageYOffset !== undefined) {
        return {
            left: window.pageXOffset,
            top: window.pageYOffset
        }
    } else {
        d = document
        r = d.documentElement
        b = d.body
        sx = r.scrollLeft || b.scrollLeft || 0
        sy = r.scrollTop || b.scrollTop || 0

        return {
            left: sx,
            top: sy
        }
    }
}
