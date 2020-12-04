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
 * @param {String|Object} property
 * @param {String} value
 *
 * @example $element = setCssVar($element, '--my-var', '12px')
 * $element = setCssVar($element, {
 *  "--my-var":   "12px",
 *  "--my-var-2": "100%"
 * })
 *
 * @returns {HTMLElement}
 */
export function setCssProperty( $element, property, value ) {
    if ( typeof property === 'string' ) {
        $element.style.setProperty( property, value );
    }
    else {
        Object.keys( property ).forEach( prop => $element.style.setProperty( prop, property[ prop ] ) );
    }

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
