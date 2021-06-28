/**
 * Return the style of a DOM element
 *
 * @param $element
 *
 * @example
 * styles = getStyle($element)
 */
export function getStyle( $element: Element ): CSSStyleDeclaration {
    return window.getComputedStyle( $element );
}


/**
 * Return the value of a style property of a DOM element
 *
 * @param $element
 * @param property - Camel case property name
 *
 * @example
 * styles = prop($element, 'marginTop')
 */
export function prop( $element: Element, property: string ): string {
    return getStyle( $element )[ <any>property ];
}


/**
 * Set a CSS property on an element
 *
 * @param $element
 * @param property
 * @param value
 *
 * @example
 * $element = setCssVar($element, '--my-var', '12px')
 *
 * @example
 * $element = setCssVar($element, {
 *  "--my-var":   "12px",
 *  "--my-var-2": "100%"
 * })
 *
 * @returns $element
 */
export function setCssProperty(
                    $element: HTMLElement,
                    property: string | { [key: string]: string },
                    value: string
                ): HTMLElement {
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
 * @param $element
 * @param property
 *
 * @example
 * value = getCssProperty($element, '--my-var')
 */
export function getCssProperty( $element: Element, property: string ): string {
    return window.getComputedStyle( $element ).getPropertyValue( property );
}
