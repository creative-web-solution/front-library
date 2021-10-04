/**
 * Return the position of an element or
 * The position relative to another element
 *
 * @param $target - If set, the position of $element will be computed relatively to this element
 *
 * @example
 * ```ts
 * { top, left } = position( $element )
 *
 * { top, left } = position( $element, $target )
 * ```
 *
 * @returns The coordinate of the object
 */
export function position( $element: HTMLElement, $target?: HTMLElement ): FLib.DOM.Position {

    if ( !$target ) {
        return {
            "top":  $element.offsetTop,
            "left": $element.offsetLeft
        };
    }

    const eleRect    = $element.getBoundingClientRect();
    const targetRect = $target.getBoundingClientRect();

    return {
        "top":   eleRect.top - targetRect.top,
        "left":  eleRect.left - targetRect.left
    };
}
