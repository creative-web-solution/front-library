import { getStyle } from './Styles';


function getOuterDim(
    $element: HTMLElement,
    border: boolean = false,
    margin: boolean = false,
    dimensionName?: string
): DOMSizeType {
    let size, elementStyle;


    if ( border || margin ) {
        size = {
            "width": dimensionName === 'height' ? -1 : $element.offsetWidth,
            "height": dimensionName === 'width' ? -1 : $element.offsetHeight
        };


        if ( margin ) {
            elementStyle = getStyle( $element );
            size = {
                "width": dimensionName === 'height' ? -1 : (size.width +
                        ( parseInt(elementStyle[ 'marginLeft' ], 10 ) || 0 ) +
                        ( parseInt(elementStyle[ 'marginRight' ], 10 ) || 0 ) ),
                "height": dimensionName === 'width' ? -1 : (size.height +
                        ( parseInt(elementStyle[ 'marginTop' ], 10 ) || 0 ) +
                        ( parseInt(elementStyle[ 'marginBottom' ], 10 ) || 0 ) )
            };
        }
    }
    else {
        size = {
            "width": dimensionName === 'height' ? -1 : $element.clientWidth,
            "height": dimensionName === 'width' ? -1 : $element.clientHeight
        };
    }

    return size;
}


/**
 * Get the outside width of a DOM element
 *
 * @param $element
 * @param border - Include border width?
 * @param margin - Include margin width?
 *
 * @example
 * // width including padding
 * elementWidth = outerWidth($element)
 *
 * @example
 * // width including padding, border and margin
 * elementWidth = outerWidth($element, true, true)
 *
 * @returns The width of the object
 */
export function outerWidth( $element: HTMLElement, border: boolean = false, margin: boolean = false ): number {
    return getOuterDim(
        $element,
        border,
        margin,
        'width'
    ).width;
}


/**
 * Get the outside height of a DOM element
 *
 * @param $element
 * @param border - Include border width?
 * @param margin - Include margin width?
 *
 * @example
 * // height including padding
 * elementHeight = outerHeight($element)
 *
 * @example
 * // height including padding, border and margin
 * elementHeight = outerHeight($element, true, true)
 *
 * @returns the height of the object
 */
export function outerHeight( $element: HTMLElement, border: boolean = false, margin: boolean = false ): number {
    return getOuterDim(
        $element,
        border,
        margin,
        'height'
    ).height;
}


/**
 * Get the outside size of a DOM element
 *
 * @param $element
 * @param border - Include border width?
 * @param margin - Include margin width?
 *
 * @example
 * // size including padding
 * {width, height} = outerSize($element)
 *
 * @example
 * // height including padding, border and margin
 * size = outerSize($element, true, true)
 *
 * @returns The width and height of the object
 */
export function outerSize( $element: HTMLElement, border: boolean = false, margin: boolean = false ): DOMSizeType {
    return getOuterDim(
        $element,
        border,
        margin
    );
}
