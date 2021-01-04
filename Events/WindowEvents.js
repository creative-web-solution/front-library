import { windowScroll } from '@creative-web-solution/front-library/DOM/windowScroll';
import { documentSize } from '@creative-web-solution/front-library/DOM/documentSize';
import { windowSize } from '@creative-web-solution/front-library/DOM/windowSize';


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
 * @example
 *
 * let w = new WindowEvents( window );
 *
 * or to change throttle delay :
 *
 * let w = new WindowEvents( window, 150 );
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
 * @param {HTMLElement} $window - DOM object on which the events will be checked
 * @param {Number} [throttleDelay=-1] - Throttle delay in ms. If < 0, it use requestAnimationFrame
 */
export function WindowEvents( $window, throttleDelay = -1 ) {
    let tick,
        windowInfo,
        scrollInfo,
        documentInfo,
        viewportInfo,
        isActive;

    const SELF                = this;
    const RESIZE_FUNCTION_SET = new Set();
    const SCROLL_FUNCTION_SET = new Set();

    $window = $window || window;

    // TOOLS

    // Call each registered function for resize event
    function updateResize( originalEvent ) {
        if ( !RESIZE_FUNCTION_SET.size ) {
            return;
        }

        RESIZE_FUNCTION_SET.forEach( fcn => {
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
        if ( !SCROLL_FUNCTION_SET.size ) {
            return;
        }

        SCROLL_FUNCTION_SET.forEach( fcn => {
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

        const FNC = ( function( ev ) {
                        return () => {
                            updateValue( ev.type );
                            SELF.refresh( ev.type, ev );
                            tick = false;
                        }
                    } )( e );

        if ( throttleDelay < 0 ) {
            window.requestAnimationFrame( FNC );
            return;
        }

        setTimeout( FNC, throttleDelay );
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
            RESIZE_FUNCTION_SET.add( callback );
        }

        if ( !type || type === 'scroll' ) {
            SCROLL_FUNCTION_SET.add( callback );
        }

        if ( !isActive && ( RESIZE_FUNCTION_SET.size || SCROLL_FUNCTION_SET.size ) ) {
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
            RESIZE_FUNCTION_SET.delete( callback );
        }

        if ( !type || type === 'scroll' ) {
            SCROLL_FUNCTION_SET.delete( callback );
        }

        // No function registered, no need to check
        if ( !RESIZE_FUNCTION_SET.size && !SCROLL_FUNCTION_SET.size ) {
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
