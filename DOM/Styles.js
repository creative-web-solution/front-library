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


/**
 * Set a CSS property on an element
 *
 * @param {HTMLElement} $element
 * @param {String} property
 * @param {String} value
 *
 * @example $element = setCssVar($element, '--my-var', '12px')
 *
 * @returns {HTMLElement}
 */
export function setCssProperty( $element, property, value ) {
    $element.style.setProperty( property, value );

    return $element;
}


/**
 * Get a CSS property of an element
 *
 * @param {HTMLElement} $element
 * @param {String} property
 *
 * @example value = getCssProperty($element, '--my-var')
 *
 * @returns {String}
 */
export function getCssProperty( $element, property ) {
    return window.getComputedStyle( $element ).getPropertyValue( property );
}
