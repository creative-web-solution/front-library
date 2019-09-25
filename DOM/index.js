/**
 * Return the index of a DOM element
 *
 * @param {HTMLElement} $element
 *
 * @example elementIndex = index( $element );
 *
 * @returns {Number} - Position (starting at 0) of the element in the DOM list is belong to.
 */
export function index( $element ) {
    let $child, idx;

    idx = 0;
    $child = $element.parentNode.firstChild;

    while ( $child && $element !== $child ) {
        if ( $child.nodeType === 1 ) {
            idx++;
        }
        $child = $child.nextSibling;
    }

    return idx;
}
