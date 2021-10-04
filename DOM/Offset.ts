function getWindow( $element: Window | Document ): Window | null {
    return $element !== null && $element === (<Window>$element).window
        ? $element
        : (<Document>$element).nodeType === 9
            ? (<Document>$element).defaultView
            : null
}


/**
 * Get the transform values of a DOM element
 *
 * @param isRelativeToViewport - If true, the position is computed relatively to the viewport (top/left of the browser) and not the top/left of the document. This mean, it doesn't take the scroll in count.
 * @param $relativeTo - Optional, compute top and left relatively to another Element
 *
 * @example
 * ```ts
 * // Get offset from the top/left of the document
 * { width, height, top, left, bottom, right } = offset( $element )
 *
 * // Same without taking the scroll position in count (top/left of the browser).
 * result = offset( $element, true )
 *
 * // Get offset relatively from another element
 * result = offset( $element, false, $target )
 * ```
 *
 * @returns the offset properties
 */
export function offset( $element: Element, isRelativeToViewport?: boolean, $relativeTo?: Element ): FLib.DOM.Offset {
    let $window, rootValue, box: FLib.DOM.Offset;

    box             = { "top": 0, "y": 0, "left": 0, "x": 0, "right": 0, "bottom": 0, "width": 0, "height": 0 };
    const $document = $element && $element.ownerDocument;

    if ( !$document ) {
        return box;
    }

    if ( typeof $element.getBoundingClientRect !== 'undefined' ) {

        const RECT = $element.getBoundingClientRect();

        box = {
            "bottom":   RECT.bottom,
            "height":   RECT.height,
            "left":     RECT.left,
            "right":    RECT.right,
            "top":      RECT.top,
            "width":    RECT.width,
            "x":        RECT.x,
            "y":        RECT.y
        };

        if ( typeof box.left === 'undefined' ) {
            box.left = box.x;
            box.top  = box.y;
        }
    }


    const retValue = {
        "top":    box.top,
        "y":      box.top,
        "left":   box.left,
        "x":      box.left,
        "bottom": box.bottom,
        "right":  box.right,
        "width":  box.width,
        "height": box.height
    };

    if ( $relativeTo ) {
        rootValue     = offset( $relativeTo );
        retValue.top  -= rootValue.top;
        retValue.left -= rootValue.left;
        retValue.x    = retValue.left;
        retValue.y    = retValue.top;
    }
    else if ( !isRelativeToViewport ) {
        $window       = getWindow( $document );

        if ( $window ) {
            retValue.top  = retValue.top + $window.pageYOffset;
            retValue.left = retValue.left + $window.pageXOffset;
            retValue.x    = retValue.left;
            retValue.y    = retValue.top;
        }
    }

    return retValue;
}
