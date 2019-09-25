import { slice } from 'front-library/Helpers/slice';
import { windowScroll } from 'front-library/DOM/windowScroll';
import { documentSize } from 'front-library/DOM/documentSize';
import { windowSize } from 'front-library/DOM/windowSize';

/**
 * @callback WindowEvents_Handler
 * @memberof WindowEvents
 * @param {Object} info
 * @param {Object} info.windowInfo
 * @param {Number} info.windowInfo.width
 * @param {Number} info.windowInfo.height
 * @param {Object} info.scrollInfo
 * @param {Number} info.scrollInfo.top
 * @param {Number} info.scrollInfo.left
 * @param {Object} info.documentInfo
 * @param {Number} info.documentInfo.width
 * @param {Number} info.documentInfo.height
 * @param {Object} info.viewportInfo
 * @param {Number} info.viewportInfo.top
 * @param {Number} info.viewportInfo.left
 * @param {Number} info.viewportInfo.bottom
 * @param {Number} info.viewportInfo.right
 * @param {Number} info.viewportInfo.width
 * @param {Number} info.viewportInfo.height
 * @param {String} eventType - resize | scroll | force
 * @param {Event} [originalEvent] - if available
 */
/**
 * Window events handler
 * @class
 *
 * @example var w = new WindowEvents( window );
 *
 * let callback = ( { windowInfo, scrollInfo, documentInfo, viewportInfo }, type, event ) => {};
 *
 * w.register( callback, 'resize' ); // type = 'resize', 'scroll' or undefined for both
 * w.remove( callback, 'resize' );
 *
 * // Force refresh of all registered function
 * w.refresh( 'scroll' );
 *
 * // Force the computing scroll position window and document size
 * w.update();
 *
 * // Call the function
 * w.get( callback );
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
        removeFromArray;

    const SELF = this;

    removeFromArray = slice;

    resizeFunctionList = [];
    scrollFunctionList = [];

    $window = $window || window;

    // TOOLS

    // Call each registered function for resize event
    function updateResize( originalEvent ) {
        if ( !resizeFunctionList.length ) {
            return;
        }

        resizeFunctionList.forEach( fcn => {
            fcn( {
                    windowInfo,
                    scrollInfo,
                    documentInfo,
                    viewportInfo
                },
                'resize',
                originalEvent
            );
        } );
    }


    // Call each registered function for scroll event
    function updateScroll( originalEvent ) {
        if ( !scrollFunctionList.length ) {
            return;
        }

        scrollFunctionList.forEach( fcn => {
            fcn( {
                    windowInfo,
                    scrollInfo,
                    documentInfo,
                    viewportInfo
                },
                'scroll',
                originalEvent
            );
        } );
    }


    function updateValue( type ) {
        if ( !type || type === 'scroll' ) {
            scrollInfo = windowScroll();
        }
        if ( !type || type === 'resize' ) {
            documentInfo = documentSize();
            windowInfo = windowSize();
        }

        viewportInfo = {
            "top":      scrollInfo.top,
            "left":     scrollInfo.left,
            "bottom":   scrollInfo.top + windowInfo.height,
            "right":    scrollInfo.left + windowInfo.width,
            "width":    windowInfo.width,
            "height":   windowInfo.height
        };
    }

    // EVENT

    function changeHandler( e ) {
        if ( tick ) {
            return;
        }

        tick = true;

        window.requestAnimationFrame(
            ( function( ev ) {
                return () => {
                    updateValue( ev.type );
                    SELF.refresh( ev.type, ev );
                    tick = false;
                }
            } )( e )
        )
    }

    // API

    /**
     * Register a function on a type of event
     *
     * @param {WindowEvents_Handler} callback
     * @param {String} type - resize | scroll | undefined (both)
     *
     * @returns {WindowEvents}
     */
    this.register = ( callback, type ) => {
        if ( !type || type === 'resize' ) {
            resizeFunctionList.push( callback );
        }

        if ( !type || type === 'scroll' ) {
            scrollFunctionList.push( callback );
        }

        if ( !isActive ) {
            $window.addEventListener( 'resize', changeHandler );
            $window.addEventListener( 'scroll', changeHandler );
            updateValue();
            isActive = true;
        }

        return this;
    }


    /**
     * Unregister a function for a type of event
     *
     * @param {WindowEvents_Handler} callback
     * @param {String} type - resize | scroll | undefined (both)
     *
     * @returns {WindowEvents}
     */
    this.remove = ( callback, type ) => {
        if ( !type || type === 'resize' ) {
            removeFromArray( resizeFunctionList, callback );
        }

        if ( !type || type === 'scroll' ) {
            removeFromArray( scrollFunctionList, callback );
        }

        // No function registered, no need to check
        if ( !resizeFunctionList.length && !scrollFunctionList.length ) {
            $window.removeEventListener( 'resize', changeHandler );
            $window.removeEventListener( 'scroll', changeHandler );
            isActive = false;
        }

        return this;
    }


    /**
     * Update all the stored data (window size, scroll position, ...)
     *
     * @param {String} type - resize | scroll | undefined (both)
     *
     * @returns {WindowEvents}
     */
    this.update = type => {
        updateValue( type );

        return this;
    }


    /**
     * Refresh all the registered functions
     *
     * @param {String} type - resize | scroll | undefined (both)
     *
     * @returns {WindowEvents}
     */
    this.refresh = ( type, _oe ) => {
        if (!type || type === 'resize') {
            updateResize( _oe );
        }

        if (!type || type === 'scroll') {
            updateScroll( _oe );
        }

        return this;
    }


    /**
     * Call a function with the last stored positions and sizes
     *
     * @param {WindowEvents_Handler} callback
     *
     * @returns {WindowEvents}
     */
    this.get = callback => {
        callback({
            windowInfo,
            scrollInfo,
            documentInfo,
            viewportInfo
        }, 'force');

        return this;
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
