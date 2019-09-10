import { strToDOM } from 'front-library/dom/str-to-dom';

/**
 * Wrap a DOM element in another
 *
 * @example $wrapper = wrap( $element, '<span class="abc"></span>' );
 *
 * @param {HTMLElement} $element
 * @param {string} tag - Example: <span></span>
 *
 * @returns {HTMLElement} - The wrap element
 */
export function wrap($element, tag) {
    let $wrapper = strToDOM(tag)

    $element.parentNode.insertBefore($wrapper, $element)

    $wrapper.appendChild($element)

    return $wrapper
}
