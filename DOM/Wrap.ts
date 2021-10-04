import { strToDOM } from './StrToDOM';
import { isString } from '../Helpers/Type';

/**
 * Wrap a DOM element in another
 *
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
