import { prop, getStyle } from './Styles';


/**
 * Compute the width of an element
 *
 * @param $element
 *
 * @example
 * elementWidth = width( $element )
 *
 * @returns The width of an element
 */
export function width( $element: Element ): number {
    return parseInt( prop( $element, 'width' ), 10 );
}


/**
 * Compute the height of an element
 *
 * @param $element
 *
 * @example
 * elementHeight = height( $element )
 *
 * @returns The height of an element
 */
export function height( $element: Element ): number {
    return parseInt( prop( $element, 'height' ), 10 );
}


/**
 * Compute the size of an element
 *
 * @param $element
 *
 * @example
 * {width, height} = size( $element )
 *
 * @returns The width and height of an element
 */
export function size( $element: Element ): DOMSizeType {
    const style  = getStyle( $element );
    const width  = style[ 'width' ];
    const height = style[ 'height' ];

    return {
        "width":  parseInt( width, 10 ),
        "height": parseInt( height, 10 )
    };
}
