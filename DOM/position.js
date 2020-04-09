/**
 * @typedef {Object} position_Object
 * @property {Number} top
 * @property {Number} left
*/
/**
 * Return the position of an element or
 * The position relative to another element
 *
 * @param {HTMLElement} $element
 * @param {HTMLElement} [$target]
 *
 * @example { top, left } = position( $element )
 * @example { top, left } = position( $element, $target )
 *
 * @returns {position_Object} - the coordinate of the object
 */
export function position( $element, $target ) {

    if ( !$target ) {
        return {
            "top": parseInt( $element.offsetTop, 10 ),
            "left": parseInt( $element.offsetLeft, 10 )
        };
    }

    const eleRect    = $element.getBoundingClientRect();
    const targetRect = $target.getBoundingClientRect();

    return {
        "top":   eleRect.top - targetRect.top,
        "left":  eleRect.left - targetRect.left
    };
}
