/**
 * Filter a DOM list depending on a selector
 *
 * @param $elements - Array of DOM elements
 * @param selector - CSS selector
 *
 * @example
 * filteredArray = filter( $elements, 'div.some-class' );
 *
 * @return Filtered list
 */
export function filter( $elements: NodeList | Element[], selector: string ): Element[] {
    const $filteredElements: Element[] = [];

    $elements.forEach( $elem => {
        if ( $elem.matches( selector ) ) {
            $filteredElements.push( $elem );
        }
    } );

    return $filteredElements;
}
