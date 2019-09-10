function getWindow($element) {
    return $element !== null && $element === $element.window
        ? $element
        : $element.nodeType === 9
            ? $element.defaultView || $element.parentWindow
            : false
}
/**
 * @typedef {object} offset_Object
 * @property {number} top
 * @property {number} left
 * @property {number} right
 * @property {number} bottom
 * @property {number} width
 * @property {number} height
*/
/**
 * Get the transform values of a DOM element
 *
 * @param {HTMLElement} $element
 * @param {boolean} isRelativeToViewport - If true, the position is computed relatively to the viewport (top/left of the browser) and not the top/left of the document. This mean, it doesn't take the scroll in count.
 * @param {HTMLElement} $relativeTo - Optional, compute top and left relatively to another Element
 *
 * @example // Get offset from the top/left of the document
 * { width, height, top, left, bottom, right } = offset( $element )
 *
 * // Same without taking the scroll position in count (top/left of the browser).
 * result = offset( $element, true )
 *
 * // Get offset relatively from another element
 * result = offset( $element, false, $target )
 *
 * @returns {offset_Object} - the offset properties
 */
export function offset($element, isRelativeToViewport, $relativeTo) {
    let $window, retValue, rootValue, box, $document;

    box = { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
    $document = $element && $element.ownerDocument;

    if (!$document) {
        return;
    }

    if (typeof $element.getBoundingClientRect !== 'undefined') {
        box = $element.getBoundingClientRect();
        if (typeof box.left === 'undefined') {
            box.left = box.x;
            box.top = box.y;
        }
    }

    $window = getWindow($document);

    retValue = {
        top: box.top,
        left: box.left,
        bottom: box.bottom,
        right: box.right,
        width: box.width,
        height: box.height
    };

    if ($relativeTo) {
        rootValue = offset($relativeTo)
        retValue.top -= rootValue.top
        retValue.left -= rootValue.left
    }
    else if (!isRelativeToViewport) {
        retValue.top = retValue.top + $window.pageYOffset;
        retValue.left = retValue.left + $window.pageXOffset;
    }


    return retValue
}
