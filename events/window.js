import { slice } from 'front-library/helpers/slice';
import { scroll } from 'front-library/dom/window-scroll';
import { documentSize } from 'front-library/dom/document-size';
import { windowSize } from 'front-library/dom/window-size';

/**
 * @callback WindowEvents_Handler
 * @memberof WindowEvents
 * @param {Object} info
 * @param {Object} info.windowInfo
 * @param {number} info.windowInfo.width
 * @param {number} info.windowInfo.height
 * @param {Object} info.scrollInfo
 * @param {number} info.scrollInfo.top
 * @param {number} info.scrollInfo.left
 * @param {Object} info.documentInfo
 * @param {number} info.documentInfo.width
 * @param {number} info.documentInfo.height
 * @param {Object} info.viewportInfo
 * @param {number} info.viewportInfo.top
 * @param {number} info.viewportInfo.left
 * @param {number} info.viewportInfo.bottom
 * @param {number} info.viewportInfo.right
 * @param {number} info.viewportInfo.width
 * @param {number} info.viewportInfo.height
 * @param {string} eventType - resize | scroll | force
 * @param {event} [originalEvent] - if available
 */
/**
 * Window events handler
 * @class
 *
 * @example var w = new WindowEvents( window );
 *
 * let myFunction = ( { windowInfo, scrollInfo, documentInfo, viewportInfo }, type, event ) => {};
 *
 * w.register( myFunction, 'resize' ); // type = 'resize', 'scroll' or undefined for both
 * w.remove( myFunction, 'resize' );
 *
 * // Force refresh of all registered function
 * w.refresh( 'scroll' );
 *
 * // Force the computing scroll position window and document size
 * w.update();
 *
 * // Call the function
 * w.get( myFunction );
 *
 * // Tools
 * { top, left } = w.scrollInfo;
 * { width, height } = w.windowInfo;
 * { width, height } = w.documentInfo;
 * { top, left, bottom, right, width, height } = w.viewportInfo;
 *
 * @param {HTMLElement} $window DOM object on which the events will be checked
 */
export function WindowEvents($window) {
    let tick,
        windowInfo,
        scrollInfo,
        documentInfo,
        viewportInfo,
        resizeFunctionList,
        scrollFunctionList,
        isActive,
        removeFromArray

    const SELF = this

    removeFromArray = slice

    resizeFunctionList = []
    scrollFunctionList = []

    $window = $window || window

    // TOOLS

    // Call each registered function for resize event
    function updateResize( originalEvent ) {
        if (!resizeFunctionList.length) {
            return
        }

        resizeFunctionList.forEach(fcn => {
            fcn( {
                    windowInfo,
                    scrollInfo,
                    documentInfo,
                    viewportInfo
                },
                'resize',
                originalEvent
            );
        })
    }

    // Call each registered function for scroll event
    function updateScroll( originalEvent ) {
        if (!scrollFunctionList.length) {
            return
        }

        scrollFunctionList.forEach(fcn => {
            fcn( {
                    windowInfo,
                    scrollInfo,
                    documentInfo,
                    viewportInfo
                },
                'scroll',
                originalEvent
            );
        })
    }

    function updateValue(type) {
        if (!type || type === 'scroll') {
            scrollInfo = scroll()
        }
        if (!type || type === 'resize') {
            documentInfo = documentSize()
            windowInfo = windowSize()
        }

        viewportInfo = {
            "top":      scrollInfo.top,
            "left":     scrollInfo.left,
            "bottom":   scrollInfo.top + windowInfo.height,
            "right":    scrollInfo.left + windowInfo.width,
            "width":    windowInfo.width,
            "height":   windowInfo.height
        }
    }

    // EVENT

    function changeHandler(e) {
        if (tick) {
            return
        }

        tick = true

        window.requestAnimationFrame(
            (function(ev) {
                return () => {
                    updateValue(ev.type)
                    SELF.refresh(ev.type)
                    tick = false
                }
            })(e)
        )
    }

    // API

    /**
     * Register a function on a type of event
     *
     * @param {WindowEvents_Handler} fcn
     * @param {string} type - resize | scroll | undefined (both)
     */
    this.register = (fcn, type) => {
        if (!type || type === 'resize') {
            resizeFunctionList.push(fcn)
        }

        if (!type || type === 'scroll') {
            scrollFunctionList.push(fcn)
        }

        if (!isActive) {
            $window.addEventListener('resize', changeHandler)
            $window.addEventListener('scroll', changeHandler)
            updateValue()
            isActive = true
        }
    }

    /**
     * Unregister a function for a type of event
     *
     * @param {WindowEvents_Handler} fcn
     * @param {string} type - resize | scroll | undefined (both)
     */
    this.remove = (fcn, type) => {
        if (!type || type === 'resize') {
            removeFromArray(resizeFunctionList, fcn)
        }

        if (!type || type === 'scroll') {
            removeFromArray(scrollFunctionList, fcn)
        }

        // No function registered, no need to check
        if (!resizeFunctionList.length && !scrollFunctionList.length) {
            $window.removeEventListener('resize', changeHandler)
            $window.removeEventListener('scroll', changeHandler)
            isActive = false
        }
    }

    /**
     * Update all the stored data (window size, scroll position, ...)
     *
     * @param {string} type - resize | scroll | undefined (both)
     */
    this.update = type => {
        updateValue(type)
    }

    /**
     * Refresh all the registered functions
     *
     * @param {string} type - resize | scroll | undefined (both)
     */
    this.refresh = ( type, originalEvent ) => {
        if (!type || type === 'resize') {
            updateResize( originalEvent );
        }

        if (!type || type === 'scroll') {
            updateScroll( originalEvent );
        }
    }

    /**
     * Call a function with the last stored positions and sizes
     *
     * @param {WindowEvents_Handler} fcn
     */
    this.get = fcn => {
        fcn({
            windowInfo,
            scrollInfo,
            documentInfo,
            viewportInfo
        }, 'force')
    }


    /**
     * Get the last stored scroll position
     *
     * @memberof WindowEvents
     * @member {Object} scrollInfo
     * @instance
     *
     * @description { top, left }
     */
    Object.defineProperty( this, 'scrollInfo', {
        "get": () => scrollInfo
    } );


    /**
     * Get the last stored window size
     *
     * @memberof WindowEvents
     * @member {Object} windowInfo
     * @instance
     *
     * @description { width, height }
     */
    Object.defineProperty( this, 'windowInfo', {
        "get": () => windowInfo
    } );


    /**
     * Get the last stored document size
     *
     * @memberof WindowEvents
     * @member {Object} documentInfo
     * @instance
     *
     * @description { width, height }
     */
    Object.defineProperty( this, 'documentInfo', {
        "get": () => documentInfo
    } );


    /**
     * Get the last stored viewport information
     *
     * @memberof WindowEvents
     * @member {Object} viewportInfo
     * @instance
     *
     * @description The viewport is the displayed part of the document.<br>
     * So, its top and left are the scroll position and its width and height are the window size.<br>
     * <br>
     * { top, left, bottom, right, width, height }
     */
    Object.defineProperty( this, 'viewportInfo', {
        "get": () => viewportInfo
    } );
}
