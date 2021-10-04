/**
 * Get the current document size
 *
 * @example
 * ```ts
 * { width, height } = documentSize()
 * ```
 */
export function documentSize(): FLib.DOM.Size {
    return {
        "height": document.documentElement.scrollHeight,
        "width":  document.documentElement.scrollWidth
    };
}
