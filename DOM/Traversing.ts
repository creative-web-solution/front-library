/**
 * Return the next element in the DOM
 *
 * @example
 * $nextElement = next($element)
 *
 * @returns The element comming after $element in the DOM or null
 */
export function next( $element: Element ): Element | null {
    return $element.nextElementSibling;
}


/**
 * Return the previous element in the DOM
 *
 * @example
 * $previousElement = previous($element)
 *
 * @returns The element comming before $element in the DOM or null
 */
export function previous( $element: Element ): Element | null {
    return $element.previousElementSibling;
}


/**
 * Return all the children of a DOM element
 *
 * @example
 * $elements = children($element)
 */
export function children( $element: Element ): Node[] {
    const childrenArray: Node[] = [];

    $element.childNodes.forEach( ( $child: Node ) => {
        if ( $child && $child.nodeType === 1 ) {
            childrenArray.push($child);
        }
    } );

    return childrenArray;
}
