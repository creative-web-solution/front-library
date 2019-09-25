/**
 * Return the style of a DOM element
 *
 * @param {HTMLElement} $element
 *
 * @example styles = getStyle($element)
 *
 * @returns {Object}
 */
export function getStyle( $element ) {
    return window.getComputedStyle( $element );
}


/**
 * Return the value of a style property of a DOM element
 *
 * @param {HTMLElement} $element
 * @param {String} property
 *
 * @example styles = prop($element, 'marginTop')
 *
 * @returns {String}
 */
export function prop( $element, property ) {
    return getStyle( $element )[ property ];
}
