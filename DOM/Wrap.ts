import { strToDOM } from '@creative-web-solution/front-library/DOM/StrToDOM';
import { isString } from '@creative-web-solution/front-library/Helpers/Type';

/**
 * Wrap a DOM element in another
 *
 * @param $element
 * @param tag - String example: <span></span>
 *
 * @example
 * $wrapper = wrap( $element, '<span class="abc"></span>' );
 *
 * @returns The wrap element
 */
export function wrap( $element: Element, tag: string | Node ): Node {
    let $wrapper: Node;

    if ( isString( tag ) ) {
        $wrapper = strToDOM( tag as string );
    }
    else {
        $wrapper = tag as Node;
    }

    if ( $element.parentNode ) {
        $element.parentNode.insertBefore( $wrapper, $element );

        $wrapper.appendChild( $element );
    }

    return $wrapper;
}
