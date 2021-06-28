/**
 * Get the current document size
 *
 * @example
 * { width, height } = documentSize()
 */
export function documentSize(): DOMSizeType {
    return {
        "height": document.documentElement.scrollHeight,
        "width":  document.documentElement.scrollWidth
    };
}
