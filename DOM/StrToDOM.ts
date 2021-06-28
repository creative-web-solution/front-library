/**
 * Convert an html string into a DOM object
 *
 * @param html
 * @param tag - Used to create an element to convert html inside. 'DIV' by default
 *
 * @example
 * $element = strToDOM( html );
 *
 * @example
 * // Use of tag parameter
 * $li = strToDOM( '<li></li>', 'UL' );
 *
 * @returns The created DOM element
 */
export function strToDOM( html: string, tag = 'DIV' ): Node | DocumentFragment {
    let $child;

    const $frag: DocumentFragment = document.createDocumentFragment();
    const $elem: HTMLElement      = document.createElement( tag );

    $elem.innerHTML = html;

    while ( $elem.childNodes.length ) {
        $child = $elem.childNodes[ 0 ];

        if ( $child && $child.nodeType === 1 ) {
            $frag.appendChild( $child );
        }
        else {
            $elem.removeChild( $child );
        }
    }

    return $frag.childNodes.length === 1 ? $frag.childNodes[ 0 ] : $frag;
}
