/**
 * Return the index of a DOM element
 *
 * @param $element
 *
 * @example
 * elementIndex = index( $element );
 *
 * @returns - Position (starting at 0) of the element in the DOM list is belong to. -1 if there is no parentNode.
 */
export function index( $element: Element ): number {
    let $child: ChildNode | null, idx: number;

    if ( !$element.parentNode ) {
        return -1;
    }

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
