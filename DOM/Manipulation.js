/**
 * Append a DOM element to an other. Require a polyfill.
 *
 * @param {HTMLElement} $what
 * @param {HTMLElement} $where
 *
 * @example append( $what, $where )
 *
 * @returns {HTMLElement} - Appened element
 */
export function append( $what, $where ) {
    $where.append( $what );

    return $what;
}

/**
 * Prepend a DOM element to an other. Require a polyfill.
 *
 * @param {HTMLElement} $what
 * @param {HTMLElement} $where
 *
 * @example prepend( $what, $where )
 *
 * @returns {HTMLElement} - Prepened element
 */
export function prepend( $what, $where ) {
    $where.prepend( $what );

    return $what;
}

/**
 * Insert a DOM element before an other
 *
 * @param {HTMLElement} $what
 * @param {HTMLElement} $where
 *
 * @example insertBefore( $what, $where )
 *
 * @returns {HTMLElement} - Inserted element
 */
export function insertBefore( $what, $where ) {
    $where.before( $what );

    return $what;
}

/**
 * Insert a DOM element after an other
 *
 * @param {HTMLElement} $what
 * @param {HTMLElement} $where
 *
 * @example insertAfter( $what, $where )
 *
 * @returns {HTMLElement} - Inserted element
 */
export function insertAfter( $what, $where ) {
    $where.after( $what );

    return $what;
}

/**
 * Clone a DOM element
 *
 * @param {HTMLElement} $element
 *
 * @example $clonedElement = clone( $element )
 *
 * @returns {HTMLElement} - Cloned element
 */
export function clone( $element ) {
    return $element.cloneNode( true );
}


/**
 * Remove an element from the DOM
 *
 * @param {HTMLElement} $element
 * @param {HTMLElement} $parent - If undefined the parentNode will be used
 *
 * @example remove( $element )
 * remove( $element, $parent )
 *
 * @returns {HTMLElement} - Removed element
 */
export function remove( $element, $parent ) {
    if ( !$parent ) {
        $parent = $element.parentNode;
    }

    if ( $parent ) {
        $parent.removeChild( $element );
    }

    return $element;
}
