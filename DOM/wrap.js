import { strToDOM } from 'front-library/DOM/strToDOM';
import { isString } from 'front-library/Helpers/Type';

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
