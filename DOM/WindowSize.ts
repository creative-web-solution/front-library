/**
 * Get the size of the window
 *
 * @example
 * ```ts
 * {width, height} = windowSize()
 * ```
 *
 * @returns The width and height of the window
 */
export function windowSize(): FLib.DOM.Size {
    return {
        "width":  window.innerWidth,
        "height": window.innerHeight
    };
}
