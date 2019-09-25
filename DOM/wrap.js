import { strToDOM } from 'front-library/DOM/strToDOM';

/**
 * Wrap a DOM element in another
 *
 * @example $wrapper = wrap( $element, '<span class="abc"></span>' );
 *
 * @param {HTMLElement} $element
 * @param {String} tag - Example: <span></span>
 *
 * @returns {HTMLElement} - The wrap element
 */
export function wrap( $element, tag ) {
    let $wrapper = strToDOM( tag );

    $element.parentNode.insertBefore( $wrapper, $element );

    $wrapper.appendChild( $element );

    return $wrapper;
}
