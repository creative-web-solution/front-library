/**
 * Return the index of a DOM element
 *
 * @example
 * elementIndex = index( $element );
 *
 * @returns - Position (starting at 0) of the element in the DOM list is belong to. -1 if there is no parentNode.
 */
export function index($element: Element): number {
    if (!$element.parentElement) {
        return -1;
    }

    return Array.from($element.parentElement.children).indexOf($element);
}
