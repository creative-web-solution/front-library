import { on, off }             from '@creative-web-solution/front-library/Events/EventsManager';
import { gesture, gestureOff } from '@creative-web-solution/front-library/Events/Gesture';
import { extend }              from '@creative-web-solution/front-library/Helpers/Extend';
import { wait }                from '@creative-web-solution/front-library/Helpers/Wait';
import { aClass, rClass }      from '@creative-web-solution/front-library/DOM/Class';
import { prop }                from '@creative-web-solution/front-library/DOM/Styles';
import { position }            from '@creative-web-solution/front-library/DOM/Position';
import { width, height }       from '@creative-web-solution/front-library/DOM/Size';


const defaultOptions: ScrollSnapOptionsType = {
    "lockedClass":        "locked",
    "minItemsToActivate": 2,
    "direction":          "h",
    "_setScroll": ( $scroller, x, y ) => {
        gsap.set( $scroller, { scrollTo: { x, y } });
    }
};


let hasIosBadScroll;


function easeInCubic( t, b, c, d ) {
    return c * ( t = t / d ) * t * t + b;
}

function getPosition( start, end, elapsed, duration ) {
    if ( elapsed > duration ) {
        return end;
    }

    return easeInCubic( elapsed, start, end - start, duration );
}


class ScrollTo {
    #startTime!:     number;
    #animationFrame;
    #duration!:      number;
    #startPosition!: number;
    #snapItem!:      ScrollSnapItemType;
    #snapItemType!:  ScrollSnapSnapType;
    #scrollPropName: ScrollSnapScrollPropertyType;
    #$element:       HTMLElement;
    #callback:       ScrollToCallbackType;


    constructor( $element: HTMLElement, direction: ScrollSnapDirectionType, callback: ScrollToCallbackType ) {
        this.#$element       = $element;
        this.#callback       = callback;
        this.#scrollPropName = direction === 'v' ? 'scrollTop' : 'scrollLeft';
    }


    private step( timestamp: number ) {
        if ( !this.#startTime ) {
            this.#startTime = timestamp;
        }

        const elapsed = timestamp - this.#startTime;

        if ( !this.#snapItem || !isNaN( this.#snapItem.coord ) ) {
            this.#$element[ this.#scrollPropName ] = getPosition(
                this.#startPosition,
                this.#snapItem.coord,
                elapsed,
                this.#duration
            );
        }

        if ( elapsed < this.#duration ) {
            this.#animationFrame = window.requestAnimationFrame( this.step.bind( this ) );
        }
        else {
            if ( typeof this.#callback === 'function' ) {
                window.requestAnimationFrame( () => {
                    this.#callback( this.#snapItem, this.#snapItemType );
                } );
            }
        }
    }


    scrollTo( item: ScrollSnapItemType, type: ScrollSnapSnapType, _duration?: number ) {
        if ( !item ) {
            return;
        }

        this.#startTime      = 0;
        this.#animationFrame = null;
        this.#snapItem       = item;
        this.#snapItemType   = type;
        this.#startPosition  = this.#$element[ this.#scrollPropName ];

        const delta = Math.abs( this.#snapItem.coord - this.#startPosition );

        if ( !delta ) {
            if ( typeof this.#callback === 'function' ) {
                window.requestAnimationFrame( () => {
                    this.#callback( this.#snapItem, this.#snapItemType );
                } );
            }
            return;
        }

        this.#duration       = typeof _duration !== 'undefined' ? _duration : delta; // ms

        this.#animationFrame = window.requestAnimationFrame( this.step.bind( this ) );
    }


    cancelAnimation() {
        window.cancelAnimationFrame( this.#animationFrame );
    }
}


/**
 * Allow to snap to items when using a native scroll
 *
 * @example
 * let sn = new ScrollSnap($scroller, options);
 *
 * // To refresh
 * sn.refresh( [options] )
 *
 * // To navigate
 * sn.previous( [duration] )
 * sn.next( [duration] )
 * sn.scrollToItem( $item [, duration] )
 * sn.scrollToIndex( index [, duration] )
 *
 * // To remove
 * sn.clean()
 */
export default class ScrollSnap {

    #$snapItems!:               NodeList;
    #snapPoints:                ScrollSnapItemType[];
    #halfSize: {
        coord: number;
        index: number;
        $item: HTMLElement
    }[];
    #scrollTimeoutId;
    #scrollTickTimeout;
    #scrollToHandler:           ScrollTo;
    #state:                     string;
    #minItemsToActivate:        number;
    #scrollerSize!:             number;
    #offsetSize!:               number;
    #options:                   ScrollSnapOptionsType;
    #hasSwipe:                  boolean;
    #touchended:                boolean;
    #currentSnapItem!:          ScrollSnapItemType;
    #areEventsBinded!:          boolean;
    #lastTouchPosition!:        GestureCoordsType;
    #IS_VERTICAL_MODE:          boolean;
    #SCROLL_PROPERTY_NAME:      ScrollSnapScrollPropertyType;
    #SCROLL_SIZE_PROPERTY_NAME: ScrollSnapSizePropertyType;
    #$scroller:                 HTMLElement

    #TIMEOUT_DELAY              = 100;
    #STATE_IDLE                 = 'idle';
    #STATE_MOVING               = 'moving';
    #STATE_LOCKED               = 'locked';
    #SCROLL_END_TRESHOLD        = 5;


    constructor( $scroller: HTMLElement, userOptions: ScrollSnapOptionsType = {} ) {

        this.#$scroller = $scroller;
        this.#options   = extend( defaultOptions, userOptions );

        this.#IS_VERTICAL_MODE          = this.#options.direction === 'v'
        this.#SCROLL_PROPERTY_NAME      = this.#IS_VERTICAL_MODE
            ? 'scrollTop'
            : 'scrollLeft';

        this.#SCROLL_SIZE_PROPERTY_NAME = this.#IS_VERTICAL_MODE
            ? 'scrollHeight'
            : 'scrollWidth';

        this.#hasSwipe   = false;
        this.#touchended = true;

        this.#state = this.#STATE_IDLE;

        this.#minItemsToActivate = this.#options.minItemsToActivate as number;

        // Store the coordinate and the DOM object of each item
        this.#snapPoints = [];
        // Store the coordinate of the middle and the DOM object of each item
        this.#halfSize = [];

        this.#scrollToHandler = new ScrollTo( $scroller, this.#options.direction as ScrollSnapDirectionType, this.resetState.bind( this ) );

        this.refresh( {
            "snapTo": this.#options.snapTo
        } );
    }


    private getScrollPositionInformation() {
        let scrollPos = this.#$scroller[ this.#SCROLL_PROPERTY_NAME ];

        return {
            "scrollAtStart": scrollPos === 0,
            "scrollAtEnd":   scrollPos + this.#scrollerSize >= this.#$scroller[ this.#SCROLL_SIZE_PROPERTY_NAME ] - this.#SCROLL_END_TRESHOLD
        }
    }


    private resetState( snapItem: ScrollSnapItemType, type: ScrollSnapSnapType ) {
        this.#state           = this.#STATE_IDLE;
        this.#touchended      = true;

        this.#currentSnapItem = snapItem;

        this.bindEvents();

        if ( this.#options.onSnapEnd ) {
            this.#options.onSnapEnd( {
                "$scroller":  this.#$scroller,
                snapItem,
                type,
                "scrollerSize": this.#scrollerSize,
                "offsetSize":   this.#offsetSize,
                ...this.getScrollPositionInformation()
            } );
        }

        this.processLimit( snapItem, type, true );
    }


    private getCurrentSection( scrollPos: number ) {
        let len = this.#halfSize.length;

        if ( scrollPos <= 0 ) {
            return 0;
        }

        for ( let i = 0; i < len; ++i ) {
            if ( scrollPos <= this.#halfSize[ i ].coord ) {
                return i;
            }
        }

        return len;
    }


    private cancelAutoScroll() {
        clearTimeout( this.#scrollTimeoutId );
        this.#scrollToHandler.cancelAnimation();
        window.cancelAnimationFrame( this.#scrollTickTimeout );
    }


    #interuptAnimation = () => {
        off( this.#$scroller, {
            "eventsName": "wheel",
            "callback": this.#interuptAnimation
        } );
        this.cancelAutoScroll();
        this.#state = this.#STATE_IDLE;
        this.#touchended = true;
    }


    private handleInterruption() {
        on( this.#$scroller, {
            "eventsName": "wheel",
            "callback": this.#interuptAnimation
        } );
    }


    /* Return true if the start or the end is reached */
    private processLimit( snapItem: ScrollSnapItemType, type: ScrollSnapSnapType, fromResetState?: boolean ) {

        if ( this.#$scroller[ this.#SCROLL_PROPERTY_NAME ] + this.#scrollerSize >= this.#$scroller[ this.#SCROLL_SIZE_PROPERTY_NAME ] - this.#SCROLL_END_TRESHOLD ) {
            if ( !fromResetState ) {
                this.resetState( snapItem, type );
            }

            if ( this.#options.onReachEnd ) {
                this.#options.onReachEnd( {
                    "$scroller":    this.#$scroller,
                    snapItem,
                    type,
                    "scrollerSize": this.#scrollerSize,
                    "offsetSize":   this.#offsetSize,
                    ...this.getScrollPositionInformation()
                } );
            }
            return true;
        }
        else if ( this.#$scroller[ this.#SCROLL_PROPERTY_NAME ] === 0 )  {
            if ( !fromResetState ) {
                this.resetState(snapItem, type);
            }

            if ( this.#options.onReachStart ) {
                this.#options.onReachStart( {
                    "$scroller":    this.#$scroller,
                    snapItem,
                    type,
                    "scrollerSize": this.#scrollerSize,
                    "offsetSize":   this.#offsetSize
                } );
            }
            return true;
        }

        return false;
    }


    private processScroll() {
        let snapItem = this.#snapPoints[ this.getCurrentSection( this.#$scroller[ this.#SCROLL_PROPERTY_NAME ] ) ];

        if ( this.processLimit( snapItem, 'scroll' ) ) {
            return;
        }

        if ( this.#options.onSnapStart ) {
            this.#options.onSnapStart( {
                "$scroller":    this.#$scroller,
                "snapItem":     this.#currentSnapItem,
                "type":         "scroll",
                "scrollerSize": this.#scrollerSize,
                "offsetSize":   this.#offsetSize,
                ...this.getScrollPositionInformation()
            } );
        }

        this.#scrollToHandler.scrollTo(
            snapItem,
            'scroll'
        );
        this.#state = this.#STATE_MOVING;

        this.handleInterruption();
    }


    private debounceScroll() {
        clearTimeout( this.#scrollTimeoutId );
        window.cancelAnimationFrame( this.#scrollTickTimeout );
        this.#scrollTickTimeout = window.requestAnimationFrame( this.processScroll.bind( this ) );
    }


    #onScroll = () => {
        if ( this.#state !== this.#STATE_IDLE || !this.#touchended ) {
            return;
        }

        this.#state = this.#STATE_IDLE;

        this.cancelAutoScroll();

        this.#scrollTimeoutId = setTimeout( this.debounceScroll.bind( this ), this.#TIMEOUT_DELAY );
    }


    private removeEvents() {
        if ( !this.#areEventsBinded ) {
            return;
        }

        this.#areEventsBinded = false;

        off( this.#$scroller, {
            "eventsName": "scroll",
            "callback": this.#onScroll
        } );
        gestureOff( this.#$scroller, 'scrollSnapTouchSwipe' );
    }


    private bindEvents() {
        if ( this.#areEventsBinded ) {
            return;
        }

        this.#areEventsBinded = true;

        on( this.#$scroller, {
            "eventsName": "scroll",
            "callback":   this.#onScroll
        } );

        gesture( this.#$scroller, 'scrollSnapTouchSwipe', {
            "swipe": this.#onSwipe,
            "start": this.#onTouchstart,
            "end":   this.#onTouchend
        } );
    }


    private updateOptions( newOptions: ScrollSnapOptionsType ) {

        let { offset, $offsetElement, direction } = newOptions;

        if ( direction ) {
            this.#options.direction = direction;
        }

        if ( offset ) {
            this.#options.offset = offset;
        }

        if ( $offsetElement ) {
            this.#options.$offsetElement = $offsetElement;
        }
    }


    /**
     * Refresh the scroller and snap to the asked item
     */
    refresh( _options: ScrollSnapRefreshOptionType = {} ) {
        let propPos;

        let { snapTo, $itemToSnapOn } = _options;

        this.updateOptions( _options );

        if ( !snapTo ) {
            snapTo = this.#options.snapTo;
        }
        else {
            this.#options.snapTo = snapTo;
        }

        propPos                 = this.#IS_VERTICAL_MODE ? 'top' : 'left';
        this.#offsetSize        = 0;
        this.#snapPoints.length = 0;
        this.#halfSize.length   = 0;

        this.#options._setScroll?.( this.#$scroller, 0, 0 );

        if ( snapTo ) {
            this.#$snapItems =
                typeof this.#options.snapTo === 'string'
                    ? this.#$scroller.querySelectorAll( snapTo as string )
                    : snapTo as NodeList;
        }

        if ( this.#$snapItems.length < this.#minItemsToActivate ) {
            this.#state      = this.#STATE_LOCKED;
            this.#touchended = true;

            this.removeEvents();
            aClass( this.#$scroller, this.#options.lockedClass as string );

            return;
        }

        this.bindEvents();

        this.#state      = this.#STATE_IDLE;
        this.#touchended = true;

        rClass( this.#$scroller, this.#options.lockedClass as string );

        if ( this.#options.$offsetElement ) {
            const tmpOffset =  prop( this.#options.$offsetElement, 'margin-' + propPos ) || 0;
            this.#offsetSize = tmpOffset === 0 ? 0 : Math.round( parseFloat( tmpOffset as string ) );
        }
        else if ( this.#options.offset ) {
            this.#offsetSize = this.#options.offset[ propPos ] || 0;
        }

        this.#scrollerSize = this.#IS_VERTICAL_MODE ? height( this.#$scroller ) : width( this.#$scroller );

        this.#$snapItems.forEach( ( $item, index ) => {
            const $ITM = $item as HTMLElement;
            let _position = position( $ITM );
            let snapItem: ScrollSnapItemType = {
                "coord":   _position[ propPos ] - this.#offsetSize,
                "index":   index,
                "isFirst": index === 0,
                "isLast":  index === this.#$snapItems.length - 1,
                "$item":   $ITM
            };

            if ( $itemToSnapOn === $item ) {
                this.#currentSnapItem = snapItem;

                if ( this.#IS_VERTICAL_MODE ) {
                    this.#options._setScroll?.( this.#$scroller, 0, snapItem.coord );
                }
                else {
                    this.#options._setScroll?.( this.#$scroller, snapItem.coord, 0 );
                }
            }
            else if ( !this.#currentSnapItem ) {
                this.#currentSnapItem = snapItem;
            }

            this.#snapPoints.push( snapItem );

            if ( index ) {
                this.#halfSize.push( {
                    "coord": Math.ceil(
                        this.#snapPoints[ index - 1 ].coord +
                            (_position[ propPos ] -
                                this.#offsetSize -
                                this.#snapPoints[ index - 1 ].coord) /
                                2
                    ),
                    "index": index,
                    "$item": $ITM
                });
            }
        });
    }


    // Scroll event fired only on touchmove and at the end of the scrolling
    // on some old iOS or on all iOS (up to 11) in PWA or hybrid app...
    #onSwipe = () => {
        let scrollPos;

        this.#hasSwipe = true;

        // Cancel scroll watching fired on touchmove,
        // Allow us to wait for the last scroll event fired one time at the end of the scrolling for bad iOS scroll behaviour
        this.cancelAutoScroll();

        if ( hasIosBadScroll !== undefined ) {
            return;
        }

        scrollPos = this.#$scroller[ this.#SCROLL_PROPERTY_NAME ];

        setTimeout( () => {
            hasIosBadScroll = scrollPos === this.#$scroller[ this.#SCROLL_PROPERTY_NAME ]
        }, this.#TIMEOUT_DELAY - 20 );
    }


    private onInitMove() {
        if ( this.#state === this.#STATE_MOVING ) {
            this.#interuptAnimation();
        }
        this.#hasSwipe   = false;
        this.#touchended = false;
        this.cancelAutoScroll();

    }


    #onTouchstart = ( e: Event, $targetElement: HTMLElement, position: GestureCoordsType ) => {
        this.onInitMove()
        this.#lastTouchPosition = position;
    }


    #onTouchend = ( e: Event, $targetElement: HTMLElement, position: GestureCoordsType) => {
        let deltaX = Math.abs( this.#lastTouchPosition.pageX - position.pageX );

        if ( this.#state === this.#STATE_MOVING || deltaX < 2  ) {
            return;
        }

        this.#touchended = true;

        // Cancel scroll watching fired on touchmove,
        // Allow us to wait for the last scroll event fired one time at the end of the scrolling for bad iOS scroll behaviour
        this.cancelAutoScroll();
        if ( !this.#hasSwipe ) {
            this.#scrollTimeoutId = setTimeout( this.debounceScroll.bind( this ), this.#TIMEOUT_DELAY );
        }
    }


    /**
     * Scroll to a specific index
     *
     * @param index
     * @param [duration] - In ms
     */
    scrollToIndex( index: number, duration?: number ) {

        if ( index < 0 || !this.#snapPoints[ index ] ) {
            return;
        }

        this.#state = this.#STATE_MOVING;

        this.removeEvents();
        this.onInitMove();
        this.#touchended = true;


        if ( this.#options.onSnapStart ) {
            this.#options.onSnapStart( {
                "$scroller":    this.#$scroller,
                "snapItem":     this.#currentSnapItem,
                "type":         "api",
                "scrollerSize": this.#scrollerSize,
                "offsetSize":   this.#offsetSize,
                ...this.getScrollPositionInformation()
            } );
        }

        this.#scrollToHandler.scrollTo( this.#snapPoints[ index ], "api", duration );
    }


    /**
     * Scroll to a specific item
     *
     * @param $item
     * @param [duration] - In ms
     */
    scrollToItem( $item: HTMLElement, duration?: number ) {
        const snapItem = this.#snapPoints.find( snapPoint => snapPoint.$item === $item );

        if ( !snapItem ) {
            return;
        }

        this.#state = this.#STATE_MOVING;

        this.removeEvents();
        this.onInitMove();
        this.#touchended = true;

        this.#currentSnapItem = snapItem;

        if ( this.#options.onSnapStart ) {
            this.#options.onSnapStart( {
                "$scroller":    this.#$scroller,
                "snapItem":     this.#currentSnapItem,
                "type":         "api",
                "scrollerSize": this.#scrollerSize,
                "offsetSize":   this.#offsetSize,
                ...this.getScrollPositionInformation()
            } );
        }

        if ( duration === 0 ) {
            if ( this.#IS_VERTICAL_MODE ) {
                this.#options._setScroll?.( this.#$scroller, 0, snapItem.coord );
            }
            else {
                this.#options._setScroll?.( this.#$scroller, snapItem.coord, 0 );
            }
            wait().then( () => this.resetState( snapItem, "api" ) );
        }
        else {
            this.#scrollToHandler.scrollTo( snapItem, "api", duration );
        }

    }


    /**
     * Scroll to the next item
     *
     * @param [duration] - In ms
     */
    next( duration?: number ) {
        let nextIndex = this.#currentSnapItem.index + 1;

        if ( !this.#snapPoints[ nextIndex ] ) {
            return;
        }

        this.removeEvents();
        this.onInitMove();
        this.#touchended = true;

        this.#state = this.#STATE_MOVING;

        if ( this.#options.onSnapStart ) {
            this.#options.onSnapStart( {
                "$scroller":    this.#$scroller,
                "snapItem":     this.#currentSnapItem,
                "type":         "api",
                "scrollerSize": this.#scrollerSize,
                "offsetSize":   this.#offsetSize,
                ...this.getScrollPositionInformation()
            } );
        }

        this.#scrollToHandler.scrollTo( this.#snapPoints[ nextIndex ], "api", duration );
    }


    /**
     * Scroll to the previous item
     * @param [duration] - In ms
     */
    previous( duration?: number ) {
        let previousIndex = this.#currentSnapItem.index - 1;

        if ( previousIndex < 0 || !this.#snapPoints[ previousIndex ] ) {
            return;
        }

        this.removeEvents();
        this.onInitMove();
        this.#touchended = true;

        this.#state = this.#STATE_MOVING;

        if ( this.#options.onSnapStart ) {
            this.#options.onSnapStart( {
                "$scroller":    this.#$scroller,
                "snapItem":     this.#currentSnapItem,
                "type":         "api",
                "scrollerSize": this.#scrollerSize,
                "offsetSize":   this.#offsetSize,
                ...this.getScrollPositionInformation()
            } );
        }

        this.#scrollToHandler.scrollTo( this.#snapPoints[ previousIndex ], "api", duration );
    }


    /**
     * Remove all events, css class or inline styles
     */
    clean() {
        this.cancelAutoScroll();
        off( this.#$scroller, {
            "eventsName": "scroll",
            "callback":   this.#onScroll
        } );
        off( this.#$scroller, {
            "eventsName": "wheel",
            "callback":   this.#interuptAnimation
        } );
        gestureOff( this.#$scroller, 'scrollSnapTouchSwipe' );
    }
}

