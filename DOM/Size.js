import { prop, getStyle } from '@creative-web-solution/front-library/DOM/Styles';

/**
 * Compute the width of an element
 *
 * @param {HTMLElement} $element
 *
 * @example elementWidth = width( $element )
 *
 * @returns {Number} the width of an element
 */
export function width( $element ) {
    return parseInt( prop( $element, 'width' ), 10 );
}


/**
 * Compute the height of an element
 *
 * @param {HTMLElement} $element
 *
 * @example elementHeight = height( $element )
 *
 * @returns {Number} the height of an element
 */
export function height( $element ) {
    return parseInt( prop( $element, 'height' ), 10 );
}


/**
 * @typedef {Object} size_Object
 * @property {Number} width
 * @property {Number} height
 */
/**
 * Compute the size of an element
 *
 * @param {HTMLElement} $element
 *
 * @example {width, height} = size( $element )
 *
 * @returns {size_Object} - the width and height of an element
 */
export function size( $element ) {
    let style, width, height;

    style = getStyle( $element );
    width = style[ 'width' ];
    height = style[ 'height' ];

    return {
        "width": parseInt( width, 10 ),
        "height": parseInt( height, 10 )
    };
}
