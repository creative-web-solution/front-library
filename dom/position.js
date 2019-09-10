/**
 * @typedef {object} position_Object
 * @property {number} top
 * @property {number} left
*/
/**
 * Return the position of an element
 *
 * @param {HTMLElement} $element
 *
 * @example { top, left } = position( $element )
 *
 * @returns {position_Object} - the coordinate of the object
 */
export function position($element) {
    return {
        top: parseInt($element.offsetTop, 10),
        left: parseInt($element.offsetLeft, 10)
    }
}
