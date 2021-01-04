import { strToDOM } from '@creative-web-solution/front-library/DOM/strToDOM';
import { isString } from '@creative-web-solution/front-library/Helpers/Type';

/**
 * Wrap a DOM element in another
 *
 * @example $wrapper = wrap( $element, '<span class="abc"></span>' );
 *
 * @param {HTMLElement} $element
 * @param {String|HTMLElement} tag - String example: <span></span>
 *
 * @returns {HTMLElement} - The wrap element
 */
export function wrap( $element, tag ) {
    let $wrapper;

    if ( isString( tag ) ) {
        $wrapper = strToDOM( tag );
    }
    else {
        $wrapper = tag;
    }

    $element.parentNode.insertBefore( $wrapper, $element );

    $wrapper.appendChild( $element );

    return $wrapper;
}
