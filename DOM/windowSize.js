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
    let w, h, win, doc, docElem, docBody;

    win = window;
    doc = document;
    docElem = doc.documentElement;
    docBody = doc.body;
    w = h = 0;

    if ( !win.innerWidth ) {
        if ( docElem.clientWidth !== 0 ) {
            //strict mode
            w = docElem.clientWidth;
            h = docElem.clientHeight;
        }
        else {
            //quirks mode
            w = docBody.clientWidth;
            h = docBody.clientHeight;
        }
    }
    else {
        //w3c
        w = win.innerWidth;
        h = win.innerHeight;
    }

    return {
        "width": w,
        "height": h
    };
}
