/**
 * Filter a DOM list depending on a selector
 *
 * @param {HTMLElement[]} $elements
 * @param {String} selector
 *
 * @example filteredArray = filter( $elements, selector );
 *
 * @return {HTMLElement[]} - Filtered list
 */
export function filter( $elements, selector ) {
    let $filteredElements = [];

    $elements.forEach( $elem => {
        if ( $elem.matches( selector ) ) {
            $filteredElements.push( $elem );
        }
    } );

    return $filteredElements;
}
