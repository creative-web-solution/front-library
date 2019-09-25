/**
 * Return the next element in the DOM
 *
 * @param {HTMLElement} $element
 *
 * @example $nextElement = next($element)
 *
 * @returns {HTMLElement}
 */
export function next($element) {
    return $element.nextElementSibling;
}


/**
 * Return the previous element in the DOM
 *
 * @param {HTMLElement} $element
 *
 * @example $previousElement = previous($element)
 *
 * @returns {HTMLElement}
 */
export function previous($element) {
    return $element.previousElementSibling;
}


/**
 * Return all the children of a DOM element
 *
 * @param {HTMLElement} $element
 *
 * @example $elements = children($element)
 *
 * @returns {HTMLElement[]}
 */
export function children( $element ) {
    let childrenArray = [];

    $element.childNodes.forEeach( $child => {
        if ( $child && $child.nodeType === 1 ) {
            childrenArray.push($child);
        }
    } );

    return childrenArray;
}
