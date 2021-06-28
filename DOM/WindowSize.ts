/**
 * Get the size of the window
 *
 * @example
 * {width, height} = windowSize()
 *
 * @returns The width and height of the window
 */
export function windowSize(): DOMSizeType {
    return {
        "width":  window.innerWidth,
        "height": window.innerHeight
    };
}
