/**
 * Append a DOM element to an other. Require a polyfill.
 *
 * @param $what - Element to append
 * @param $into - Container
 *
 * @example
 * append( $what, $into )
 *
 * @returns $what
 */
export function append( $what: Element, $into: Element ): Element {
    $into.append( $what );

    return $what;
}


/**
 * Prepend a DOM element to an other. Require a polyfill.
 *
 * @param $what - Element to prepend
 * @param $into - Container
 *
 * @example
 * prepend( $what, $into )
 *
 * @returns $what
 */
export function prepend( $what: Element, $into: Element ): Element {
    $into.prepend( $what );

    return $what;
}

/**
 * Insert a DOM element before an other
 *
 * @param $what - Element to insert
 * @param $before - Target element to insert before
 *
 * @example
 * insertBefore( $what, $before )
 *
 * @returns $what
 */
export function insertBefore( $what: Element, $before: Element ): Element {
    $before.before( $what );

    return $what;
}


/**
 * Insert a DOM element after an other
 *
 * @param $what - Element to insert
 * @param $after - Target element to insert after
 *
 * @example insertAfter( $what, $after )
 *
 * @returns $what
 */
export function insertAfter( $what: Element, $after: Element ): Element {
    $after.after( $what );

    return $what;
}

/**
 * Clone a DOM element
 *
 * @param $element
 *
 * @example
 * $clonedElement = clone( $element )
 *
 * @returns Cloned element
 */
export function clone( $element: Node ): Node {
    return $element.cloneNode( true );
}


/**
 * Remove an element from the DOM
 *
 * @param $element
 * @param $parentNode - If undefined the parentNode will be used
 *
 * @example
 * remove( $element )
 *
 * @example
 * remove( $element, $parentNode )
 *
 * @returns $element
 */
export function remove( $element: Element, $parentNode?: Element ): Element {
    const $parent = $parentNode || $element.parentNode;

    if ( $parent ) {
        $parent.removeChild( $element );
    }

    return $element;
}
