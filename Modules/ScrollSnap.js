import { on, off } from '@creative-web-solution/front-library/Events/EventsManager';
import { gesture, gestureOff } from '@creative-web-solution/front-library/Events/gesture';
import { extend } from '@creative-web-solution/front-library/Helpers/extend';
import { wait } from '@creative-web-solution/front-library/Helpers/wait';
import { aClass, rClass } from '@creative-web-solution/front-library/DOM/Class';
import { prop } from '@creative-web-solution/front-library/DOM/Styles';
import { position } from '@creative-web-solution/front-library/DOM/position';
import { width, height } from '@creative-web-solution/front-library/DOM/size';

/**
 * @callback ScrollSnap_Handler
 * @memberof ScrollSnap
 * @param {Object} data
 * @param {HTMLElement} data.$scroller
 * @param {Object} data.item
 * @param {number} data.item.index
 * @param {HTMLElement} data.item.$item
 * @param {number} data.item.coords
 * @param {string} data.type - If the event comes after a scroll: scroll. If it comes after a function call (like next, previous, ...): api.
 * @param {number} data.scrollerSize
 * @param {number} data.offsetSize
 */

function easeInCubic( t, b, c, d ) {
    return c * ( t = t / d ) * t * t + b;
}

function getPosition( start, end, elapsed, duration ) {
    if ( elapsed > duration ) {
        return end;
    }

    return easeInCubic( elapsed, start, end - start, duration );
}

function ScrollTo( $element, direction, callback ) {
    let startTime, animationFrame, duration, startPosition, snapItem, snapItemType;
    const scrollPropName = direction === 'v' ? 'scrollTop' : 'scrollLeft';

    function step( timestamp ) {
        if ( !startTime ) {
            startTime = timestamp;
        }

        const elapsed = timestamp - startTime;

        if ( !snapItem || !isNaN( snapItem.coord ) ) {
            $element[ scrollPropName ] = getPosition(
                startPosition,
                snapItem.coord,
                elapsed,
                duration
            );
        }

        if ( elapsed < duration ) {
            animationFrame = window.requestAnimationFrame( step );
        }
        else {
            if ( typeof callback === 'function' ) {
                window.requestAnimationFrame( () => {
                    callback( snapItem, snapItemType );
                } );
            }
        }
    }

    this.scrollTo = ( item, type, _duration ) => {
        let delta;

        if ( !item ) {
            return;
        }

        startTime      = null;
        animationFrame = null;
        snapItem       = item;
        snapItemType   = type;
        startPosition  = $element[ scrollPropName ];

        delta = Math.abs( snapItem.coord - startPosition );

        if ( !delta ) {
            if ( typeof callback === 'function' ) {
                window.requestAnimationFrame( () => {
                    callback( snapItem, snapItemType );
                } );
            }
            return;
        }

        duration       = typeof _duration !== 'undefined' ? _duration : delta; // ms

        animationFrame = window.requestAnimationFrame( step );
    }

    this.cancelAnimation = () => {
        window.cancelAnimationFrame( animationFrame );
    }
}

let defaultOptions = {
    "lockedClass":        "locked",
    "minItemsToActivate": 2,
    "direction":          "h",
    "_setScroll": ( $scroller, x, y ) => {
        gsap.set( $scroller, { scrollTo: { x, y } });
    }
};

let hasIosBadScroll;

const TYPE_API    = 'api';
const TYPE_SCROLL = 'scroll';


/**
 * Allow to snap to items when using a native scroll
 * @class
 *
 * @param {Object} $scroller
 * @param {Object} options
 * @param {String} [options.lockedClass=locked]
 * @param {String} [options.direction=h] - Values: 'h' | 'v'
 * @param {String|HTMLElement[]} [options.snapTo]
 * @param {number} [options.minItemsToActivate=2]
 * @param {HTMLElement} [options.$offsetElement]
 * @param {Object} [options.offset]
 * @param {Number} [options.offset.top]
 * @param {Number} [options.offset.left]
 * @param {ScrollSnap_Handler} [options.onSnapStart]
 * @param {ScrollSnap_Handler} [options.onSnapEnd]
 * @param {ScrollSnap_Handler} [options.onReachStart]
 * @param {ScrollSnap_Handler} [options.onReachEnd]
 * @param {Function} [options._setScroll] - Internal function using GSAP and scrollTo plugin to set the scroll. Can be override to use another library
 *
 * @example let sn = new ScrollSnap($scroller, options);
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
export function ScrollSnap( $scroller, userOptions = {} ) {
    let $snapItems,
        snapPoints,
        halfSize,
        scrollTimeoutId,
        scrollTickTimeout,
        scrollToHandler,
        state,
        minItemsToActivate,
        scrollerSize,
        offsetSize,
        options,
        hasSwipe,
        touchended,
        currentSnapItem,
        areEventsBinded,
        lastTouchPosition;

    const TIMEOUT_DELAY       = 100;
    const STATE_IDLE          = 'idle';
    const STATE_MOVING        = 'moving';
    const STATE_LOCKED        = 'locked';
    const SCROLL_END_TRESHOLD = 5;

    options = extend( defaultOptions, userOptions );

    const IS_VERTICAL_MODE          = options.direction === 'v'
    const SCROLL_PROPERTY_NAME      = IS_VERTICAL_MODE ? 'scrollTop' : 'scrollLeft'
    const SCROLL_SIZE_PROPERTY_NAME = IS_VERTICAL_MODE
        ? 'scrollHeight'
        : 'scrollWidth';

    hasSwipe   = false;
    touchended = true;

    state = STATE_IDLE;

    minItemsToActivate = options.minItemsToActivate;

    // Store the coordinate and the DOM object of each item
    snapPoints = [];
    // Store the coordinate of the middle and the DOM object of each item
    halfSize = [];

    scrollToHandler = new ScrollTo( $scroller, options.direction, resetState );


    function getScrollPositionInformation() {
        let scrollPos = $scroller[ SCROLL_PROPERTY_NAME ];

        return {
            "scrollAtStart": scrollPos === 0,
            "scrollAtEnd": scrollPos + scrollerSize >= $scroller[ SCROLL_SIZE_PROPERTY_NAME ] - SCROLL_END_TRESHOLD
        }
    }


    function resetState( snapItem, type ) {
        state = STATE_IDLE;
        touchended = true;

        currentSnapItem = snapItem;

        bindEvents();

        if ( options.onSnapEnd ) {
            options.onSnapEnd( {
                $scroller,
                snapItem,
                type,
                scrollerSize,
                offsetSize,
                ...getScrollPositionInformation()
            } );
        }

        processLimit( snapItem, type, true );
    }


    function getCurrentSection( scrollPos ) {
        let len = halfSize.length;

        if ( scrollPos <= 0 ) {
            return 0;
        }

        for ( let i = 0; i < len; ++i ) {
            if ( scrollPos <= halfSize[ i ].coord ) {
                return i;
            }
        }

        return len;
    }


    function cancelAutoScroll() {
        clearTimeout( scrollTimeoutId );
        scrollToHandler.cancelAnimation();
        window.cancelAnimationFrame( scrollTickTimeout );
    }


    function interuptAnimation() {
        off( $scroller, {
            "eventsName": "wheel",
            "callback": interuptAnimation
        } );
        cancelAutoScroll();
        state = STATE_IDLE;
        touchended = true;
    }


    function handleInterruption() {
        on( $scroller, {
            "eventsName": "wheel",
            "callback": interuptAnimation
        } );
    }


    /* Return true if the start or the end is reached */
    function processLimit( snapItem, type, fromResetState ) {

        if ( $scroller[ SCROLL_PROPERTY_NAME ] + scrollerSize >= $scroller[ SCROLL_SIZE_PROPERTY_NAME ] - SCROLL_END_TRESHOLD ) {
            if ( !fromResetState ) {
                resetState( snapItem, type );
            }

            if ( options.onReachEnd ) {
                options.onReachEnd( {
                    $scroller,
                    snapItem,
                    type,
                    scrollerSize,
                    offsetSize,
                    ...getScrollPositionInformation()
                } );
            }
            return true;
        }
        else if ( $scroller[SCROLL_PROPERTY_NAME] === 0 )  {
            if ( !fromResetState ) {
                resetState(snapItem, type);
            }

            if ( options.onReachStart ) {
                options.onReachStart( {
                    $scroller,
                    snapItem,
                    type,
                    scrollerSize,
                    offsetSize
                } );
            }
            return true;
        }

        return false;
    }


    function processScroll() {
        let snapItem = snapPoints[ getCurrentSection( $scroller[ SCROLL_PROPERTY_NAME ] ) ];

        if ( processLimit( snapItem, TYPE_SCROLL ) ) {
            return;
        }

        if ( options.onSnapStart ) {
            options.onSnapStart( {
                $scroller,
                "snapItem": currentSnapItem,
                "type":     TYPE_SCROLL,
                scrollerSize,
                offsetSize,
                ...getScrollPositionInformation()
            } );
        }

        scrollToHandler.scrollTo(
            snapItem,
            TYPE_SCROLL
        );
        state = STATE_MOVING;

        handleInterruption()
    }


    function debounceScroll() {
        clearTimeout( scrollTimeoutId );
        window.cancelAnimationFrame( scrollTickTimeout );
        scrollTickTimeout = window.requestAnimationFrame( processScroll );
    }


    function onScroll() {
        if ( state !== STATE_IDLE || !touchended ) {
            return;
        }

        state = STATE_IDLE;

        cancelAutoScroll();

        scrollTimeoutId = setTimeout( debounceScroll, TIMEOUT_DELAY );
    }


    function removeEvents() {
        if ( !areEventsBinded ) {
            return;
        }

        areEventsBinded = false;
        off( $scroller, {
            "eventsName": "scroll",
            "callback": onScroll
        } );
        gestureOff( $scroller, 'scrollSnapTouchSwipe' );
    }


    function bindEvents() {
        if (areEventsBinded) {
            return;
        }

        areEventsBinded = true;

        on( $scroller, {
            "eventsName": "scroll",
            "callback":   onScroll
        } );

        gesture( $scroller, 'scrollSnapTouchSwipe', {
            "swipe": onSwipe,
            "start": onTouchstart,
            "end":   onTouchend
        } );
    }


    function updateOptions( newOptions ) {

        let { offset, $offsetElement, direction } = newOptions;

        if ( direction ) {
            options.direction = direction;
        }

        if ( offset ) {
            options.offset = offset;
        }

        if ( $offsetElement ) {
            options.$offsetElement = $offsetElement;
        }
    }


    /**
     * Refresh the scroller and snap to the asked item
     *
     * @memberof ScrollSnap
     * @function refresh
     * @instance
     * @param {Object} [options]
     * @param {(HTMLElement[]|string)} options.snapTo - Selector or DOMList of the items
     * @param {HTMLElement} [options.$itemToSnapOn] - Item to put on the left
     * @param {HTMLElement} [options.$offsetElement]
     * @param {Object} [options.offset]
     * @param {Number} [options.offset.top]
     * @param {Number} [options.offset.left]
     * @param {String} [options.direction] - Values: 'h' | 'v'
     */
    this.refresh = ( _options = {} ) => {
        let propPos;

        let { snapTo, $itemToSnapOn } = _options;

        updateOptions( _options );

        if ( !snapTo ) {
            snapTo = options.snapTo;
        }
        else {
            options.snapTo = snapTo;
        }

        propPos           = IS_VERTICAL_MODE ? 'top' : 'left';
        offsetSize        = 0;
        snapPoints.length = 0;
        halfSize.length   = 0;
        currentSnapItem   = null;

        options._setScroll( $scroller, 0, 0 );

        if ( snapTo ) {
            $snapItems =
                typeof options.snapTo === 'string'
                    ? $scroller.querySelectorAll( snapTo )
                    : snapTo;
        }

        if ( $snapItems.length < minItemsToActivate ) {
            state      = STATE_LOCKED;
            touchended = true;

            removeEvents();
            aClass($scroller, options.lockedClass);

            return;
        }

        bindEvents();

        state      = STATE_IDLE;
        touchended = true;

        rClass( $scroller, options.lockedClass );

        if ( options.$offsetElement ) {
            offsetSize =
                prop( options.$offsetElement, 'margin-' + propPos ) || 0;
            offsetSize = Math.round( parseFloat( offsetSize, 10 ) );
        }
        else if ( options.offset ) {
            offsetSize = options.offset[ propPos ] || 0;
        }

        scrollerSize = IS_VERTICAL_MODE ? height( $scroller ) : width( $scroller );

        $snapItems.forEach( ( $item, index ) => {
            let _position = position( $item );
            let snapItem = {
                "coord":   _position[ propPos ] - offsetSize,
                "index":   index,
                "isFirst": index === 0,
                "isLast":  index === $snapItems.length - 1,
                "$item":   $item
            };

            if ( $itemToSnapOn === $item ) {
                currentSnapItem = snapItem;
                if ( IS_VERTICAL_MODE ) {
                    options._setScroll( $scroller, 0, snapItem.coord );
                }
                else {
                    options._setScroll( $scroller, snapItem.coord, 0 );
                }
            }
            else if ( !currentSnapItem ) {
                currentSnapItem = snapItem;
            }

            snapPoints.push( snapItem );

            if ( index ) {
                halfSize.push( {
                    "coord": Math.ceil(
                        snapPoints[ index - 1 ].coord +
                            (_position[ propPos ] -
                                offsetSize -
                                snapPoints[ index - 1 ].coord) /
                                2
                    ),
                    "index": index,
                    "$item": $item
                });
            }
        });
    }


    // Scroll event fired only on touchmove and at the end of the scrolling
    // on some old iOS or on all iOS (up to 11) in PWA or hybrid app...
    function onSwipe() {
        let scrollPos;

        hasSwipe = true;

        // Cancel scroll watching fired on touchmove,
        // Allow us to wait for the last scroll event fired one time at the end of the scrolling for bad iOS scroll behaviour
        cancelAutoScroll();

        if ( hasIosBadScroll !== undefined ) {
            return;
        }

        scrollPos = $scroller[ SCROLL_PROPERTY_NAME ];

        setTimeout( () => {
            hasIosBadScroll = scrollPos === $scroller[ SCROLL_PROPERTY_NAME ]
        }, TIMEOUT_DELAY - 20 );
    }


    function onTouchstart( e, $targetElement, position ) {
        if ( state === STATE_MOVING ) {
            interuptAnimation();
        }
        hasSwipe          = false;
        touchended        = false;
        lastTouchPosition = position;
        cancelAutoScroll();
    }


    function onTouchend( e, $targetElement, position ) {
        let deltaX = Math.abs( lastTouchPosition.pageX - position.pageX );

        if ( state === STATE_MOVING || deltaX < 2  ) {
            return;
        }

        touchended = true;
        // Cancel scroll watching fired on touchmove,
        // Allow us to wait for the last scroll event fired one time at the end of the scrolling for bad iOS scroll behaviour
        cancelAutoScroll();
        if ( !hasSwipe ) {
            scrollTimeoutId = setTimeout( debounceScroll, TIMEOUT_DELAY );
        }
    }


    /**
     * Scroll to a specific index
     *
     * @memberof ScrollSnap
     * @function scrollToIndex
     * @instance
     *
     * @param {Number} index
     * @param {Number } [duration] - In ms
     */
    this.scrollToIndex = ( index, duration ) => {

        if ( index < 0 || !snapPoints[ index ] ) {
            return;
        }

        state = STATE_MOVING;

        removeEvents();
        onTouchstart();
        touchended = true;


        if ( options.onSnapStart ) {
            options.onSnapStart( {
                $scroller,
                "snapItem": currentSnapItem,
                "type":     TYPE_API,
                scrollerSize,
                offsetSize,
                ...getScrollPositionInformation()
            } );
        }

        scrollToHandler.scrollTo( snapPoints[ index ], TYPE_API, duration );
    }


    /**
     * Scroll to a specific item
     *
     * @memberof ScrollSnap
     * @function scrollToItem
     * @instance
     *
     * @param {HTMLElement} $item
     * @param {Number} [duration] - In ms
     */
    this.scrollToItem = ( $item, duration ) => {
        let snapItem = snapPoints.find( snapPoint => snapPoint.$item === $item );

        if ( !snapItem ) {
            return;
        }

        state = STATE_MOVING;

        removeEvents();
        onTouchstart();
        touchended = true;

        currentSnapItem = snapItem;

        if ( options.onSnapStart ) {
            options.onSnapStart( {
                $scroller,
                "snapItem": currentSnapItem,
                "type":     TYPE_API,
                scrollerSize,
                offsetSize,
                ...getScrollPositionInformation()
            } );
        }

        if ( duration === 0 ) {
            if ( IS_VERTICAL_MODE ) {
                options._setScroll( $scroller, 0, snapItem.coord );
            }
            else {
                options._setScroll( $scroller, snapItem.coord, 0 );
            }
            wait().then( () => resetState( snapItem, TYPE_API ) );
        }
        else {
            scrollToHandler.scrollTo( snapItem, TYPE_API, duration );
        }

    }


    /**
     * Scroll to the next item
     *
     * @memberof ScrollSnap
     * @function next
     * @instance
     *
     * @param {Number} [duration] - In ms
     */
    this.next = duration => {
        let nextIndex = currentSnapItem.index + 1;

        if ( !snapPoints[ nextIndex ] ) {
            return;
        }

        removeEvents();
        onTouchstart();
        touchended = true;

        state = STATE_MOVING;

        if ( options.onSnapStart ) {
            options.onSnapStart( {
                $scroller,
                "snapItem": currentSnapItem,
                "type":     TYPE_API,
                scrollerSize,
                offsetSize,
                ...getScrollPositionInformation()
            } );
        }

        scrollToHandler.scrollTo( snapPoints[ nextIndex ], TYPE_API, duration );
    }


    /**
     * Scroll to the previous item
     *
     * @memberof ScrollSnap
     * @function previous
     * @instance
     *
     * @param {Number} [duration] - In ms
     */
    this.previous = duration => {
        let previousIndex = currentSnapItem.index - 1;

        if ( previousIndex < 0 || !snapPoints[ previousIndex ] ) {
            return;
        }

        removeEvents();
        onTouchstart();
        touchended = true;

        state = STATE_MOVING;

        if ( options.onSnapStart ) {
            options.onSnapStart( {
                $scroller,
                "snapItem": currentSnapItem,
                "type":     TYPE_API,
                scrollerSize,
                offsetSize,
                ...getScrollPositionInformation()
            } );
        }

        scrollToHandler.scrollTo( snapPoints[ previousIndex ], TYPE_API, duration );
    }


    /**
     * Remove all events, css class or inline styles
     *
     * @memberof ScrollSnap
     * @function clean
     * @instance
     */
    this.clean = () => {
        cancelAutoScroll();
        off( $scroller, {
            "eventsName": "scroll",
            "callback":   onScroll
        } );
        off( $scroller, {
            "eventsName": "wheel",
            "callback":   interuptAnimation
        } );
        gestureOff( $scroller, 'scrollSnapTouchSwipe' );
    }

    this.refresh( options.snapTo );
}

