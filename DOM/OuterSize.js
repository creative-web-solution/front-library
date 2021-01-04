import { getStyle } from '@creative-web-solution/front-library/DOM/Styles';

function getOuterDim(
    $element,
    border,
    margin,
    dimensionName
) {
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
 * @param {HTMLElement} $element
 * @param {Boolean} border - Include border width?
 * @param {Boolean} margin - Include margin width?
 *
 * @example // width including padding
 * elementWidth = outerWidth($element)
 *
 * // width including padding, border and margin
 * elementWidth = outerWidth($element, true, true)
 *
 * @returns {Number} - the width of the object
 */
export function outerWidth( $element, border, margin ) {
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
 * @param {HTMLElement} $element
 * @param {Boolean} - border Include border width?
 * @param {Boolean} - margin Include margin width?
 *
 * @example // height including padding
 * elementHeight = outerHeight($element)
 *
 * // height including padding, border and margin
 * elementHeight = outerHeight($element, true, true)
 *
 * @returns {Number} - the height of the object
 */
export function outerHeight( $element, border, margin ) {
    return getOuterDim(
        $element,
        border,
        margin,
        'height'
    ).height;
}


/**
 * @typedef {Object} outerSize_Object
 * @property {Number} width
 * @property {Number} height
 */
/**
 * Get the outside size of a DOM element
 *
 * @param {HTMLElement} $element
 * @param {Boolean} border - Include border width?
 * @param {Boolean} margin - Include margin width?
 *
 * @example // size including padding
 * {width, height} = outerSize($element)
 *
 * // height including padding, border and margin
 * size = outerSize($element, true, true)
 *
 * @returns {outerSize_Object} - the width and height of the object
 */
export function outerSize( $element, border, margin ) {
    return getOuterDim(
        $element,
        border,
        margin
    );
}
