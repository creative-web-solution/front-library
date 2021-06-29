import { windowScroll } from '@creative-web-solution/front-library/DOM/WindowScroll';
import { documentSize } from '@creative-web-solution/front-library/DOM/DocumentSize';
import { windowSize }   from '@creative-web-solution/front-library/DOM/WindowSize';


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
 */
export default class WindowEvents {

    #tick;
    #windowInfo;
    #scrollInfo;
    #documentInfo;
    #viewportInfo;
    #isActive;
    #$window;
    #throttleDelay;

    #resizeFunctionSet = new Set();
    #scrollFunctionSet = new Set();

    /**
     * Get the last stored scroll position
     */
    get scrollInfo() {
        return this.#scrollInfo;
    }

    /**
     * Get the last stored window size
     */
    get windowInfo() {
        return this.#windowInfo;
    }

    /**
     * Get the last stored document size
     */
    get documentInfo() {
        return this.#documentInfo;
    }


    /**
     * Get the last stored viewport information
     *
     * The viewport is the displayed part of the document.<br>
     * So, its top and left are the scroll position and its width and height are the window size.<br>
     */
    get viewportInfo() {
        return this.#viewportInfo;
    }


    /**
     * @param $window - DOM object on which the events will be checked
     * @param [throttleDelay=-1] - Throttle delay in ms. If < 0, it use requestAnimationFrame
     */
    constructor( $window, throttleDelay = -1 ) {
        this.#$window       = $window;
        this.#throttleDelay = throttleDelay;
    }


    // Call each registered function for resize event
    private updateResize( originalEvent ) {
        if ( !this.#resizeFunctionSet.size ) {
            return;
        }

        this.#resizeFunctionSet.forEach( fcn => {
            ( fcn as WindowEventsCallbackType )( {
                    "windowInfo":   this.#windowInfo,
                    "scrollInfo":   this.#scrollInfo,
                    "documentInfo": this.#documentInfo,
                    "viewportInfo": this.#viewportInfo
                },
                'resize',
                originalEvent
            );
        } );
    }


    // Call each registered function for scroll event
    private updateScroll( originalEvent ) {
        if ( !this.#scrollFunctionSet.size ) {
            return;
        }

        this.#scrollFunctionSet.forEach( fcn => {
            ( fcn as WindowEventsCallbackType )( {
                    "windowInfo":   this.#windowInfo,
                    "scrollInfo":   this.#scrollInfo,
                    "documentInfo": this.#documentInfo,
                    "viewportInfo": this.#viewportInfo
                },
                'scroll',
                originalEvent
            );
        } );
    }


    private updateValue( type?: WindowEventsType ) {
        if ( type !== 'resize' ) {
            this.#scrollInfo = windowScroll();
        }
        if ( type !== 'scroll' ) {
            this.#documentInfo = documentSize();
            this.#windowInfo   = windowSize();
        }

        this.#viewportInfo = {
            "top":      this.#scrollInfo.top,
            "left":     this.#scrollInfo.left,
            "bottom":   this.#scrollInfo.top + this.#windowInfo.height,
            "right":    this.#scrollInfo.left + this.#windowInfo.width,
            "width":    this.#windowInfo.width,
            "height":   this.#windowInfo.height
        };
    }


    #changeHandler = ( e: Event ) => {
        if ( this.#tick ) {
            return;
        }

        this.#tick = true;

        const FNC = ( ( ev: Event ) => {
                        return () => {
                            const TYPE = ev.type === 'scroll' ? 'scroll' : 'resize';
                            this.updateValue( TYPE );
                            this.refresh( TYPE, ev );
                            this.#tick = false;
                        }
                    } )( e );

        if ( this.#throttleDelay < 0 ) {
            window.requestAnimationFrame( FNC );
            return;
        }

        setTimeout( FNC, this.#throttleDelay );
    }


    /**
     * Register a function on a type of event
     *
     * @param callback
     * @param type - resize | scroll | undefined (both)
     */
    register( callback: WindowEventsCallbackType, type?: WindowEventsType ): this {
        if ( type !== 'scroll' ) {
            this.#resizeFunctionSet.add( callback );
        }

        if ( type !== 'resize' ) {
            this.#scrollFunctionSet.add( callback );
        }

        if ( !this.#isActive && ( this.#resizeFunctionSet.size || this.#scrollFunctionSet.size ) ) {
            this.#$window.addEventListener( 'resize', this.#changeHandler );
            this.#$window.addEventListener( 'scroll', this.#changeHandler );
            this.updateValue();
            this.#isActive = true;
        }

        return this;
    }


    /**
     * Unregister a function for a type of event
     *
     * @param callback
     * @param type - resize | scroll | undefined (both)
     */
    remove( callback: WindowEventsCallbackType, type?: WindowEventsType ): this {
        if ( type !== 'scroll' ) {
            this.#resizeFunctionSet.delete( callback );
        }

        if ( type !== 'resize' ) {
            this.#scrollFunctionSet.delete( callback );
        }

        // No function registered, no need to check
        if ( !this.#resizeFunctionSet.size && !this.#scrollFunctionSet.size ) {
            this.#$window.removeEventListener( 'resize', this.#changeHandler );
            this.#$window.removeEventListener( 'scroll', this.#changeHandler );
            this.#isActive = false;
        }

        return this;
    }


    /**
     * Update all the stored data (window size, scroll position, ...)
     *
     * @param type - resize | scroll | undefined (both)
     */
    update( type?: WindowEventsType ): this {
        this.updateValue( type );

        return this;
    }


    /**
     * Refresh all the registered functions
     *
     * @param type - resize | scroll | undefined (both)
     */
    refresh( type?: WindowEventsType, _oe?: Event ): this {
        if ( type !== 'scroll' ) {
            this.updateResize( _oe );
        }

        if ( type !== 'resize' ) {
            this.updateScroll( _oe );
        }

        return this;
    }


    /**
     * Call a function with the last stored positions and sizes
     *
     * @param callback
     */
    get( callback: WindowEventsCallbackType ): this {
        callback({
                "windowInfo":   this.#windowInfo,
                "scrollInfo":   this.#scrollInfo,
                "documentInfo": this.#documentInfo,
                "viewportInfo": this.#viewportInfo
            },
            'force'
        );

        return this;
    }
}
