/**
 * @typedef {Object} windowSizeObject
 * @property {Number} width
 * @property {Number} height
 */
/**
 * Get the size of the window
 *
 * @example {width, height} = windowSize()
 *
 * @returns {windowSizeObject} - the width and height of the window
 */
export function windowSize() {
    return {
        "width":  window.innerWidth,
        "height": window.innerHeight
    };
}
