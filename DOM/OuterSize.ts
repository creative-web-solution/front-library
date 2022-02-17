import { getStyle } from './Styles';


function getOuterDim(
    $element: HTMLElement,
    border = false,
    margin = false,
    dimensionName?: string
): FLib.DOM.Size {
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
 * @param border - Include border width?
 * @param margin - Include margin width?
 *
 * @example
 * ```ts
 * // width including padding
 * elementWidth = outerWidth($element)
 *
 * // width including padding, border and margin
 * elementWidth = outerWidth($element, true, true)
 * ```
 *
 * @returns The width of the object
 */
export function outerWidth( $element: HTMLElement, border = false, margin = false ): number {
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
 * @param border - Include border width?
 * @param margin - Include margin width?
 *
 * @example
 * ```ts
 * // height including padding
 * elementHeight = outerHeight($element)
 *
 * // height including padding, border and margin
 * elementHeight = outerHeight($element, true, true)
 * ```
 *
 * @returns the height of the object
 */
export function outerHeight( $element: HTMLElement, border = false, margin = false ): number {
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
 * @param border - Include border width?
 * @param margin - Include margin width?
 *
 * @example
 * ```ts
 * // size including padding
 * {width, height} = outerSize($element)
 *
 * // height including padding, border and margin
 * size = outerSize($element, true, true)
 * ```
 *
 * @returns The width and height of the object
 */
export function outerSize( $element: HTMLElement, border = false, margin = false ): FLib.DOM.Size {
    return getOuterDim(
        $element,
        border,
        margin
    );
}