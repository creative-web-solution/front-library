import { on, off } from 'front-library/events/event-manager';
import { gesture, gestureOff } from 'front-library/events/gesture';
import { extend } from 'front-library/helpers/extend';
import { wait } from 'front-library/helpers/wait';
import { aClass, rClass } from 'front-library/dom/class';
import { prop } from 'front-library/dom/styles';
import { position } from 'front-library/dom/position';
import { width, height } from 'front-library/dom/size';

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
/**
 * ScrollSnap
 * @class ScrollSnap
 *
 * @param {object} $scroller
 * @param {Object} options
 * @param {string} [options.lockedClass=locked]
 * @param {string} [options.direction=h] - Values: 'h' | 'v'
 * @param {(string|HTMLElement[])} [options.snapTo]
 * @param {number} [options.minItemsToActivate=2]
 * @param {HTMLElement} [options.$offsetElement]
 * @param {ScrollSnap_Handler} [options.onSnapStart]
 * @param {ScrollSnap_Handler} [options.onSnapEnd]
 * @param {ScrollSnap_Handler} [options.onReachStart]
 * @param {ScrollSnap_Handler} [options.onReachEnd]
 *
 * @example let sn = new ScrollSnap($scroller, options);
 *
 * // To refresh
 * sn.refresh()
 */
let ScrollSnap;

{

function easeInCubic(t, b, c, d) {
    return c * (t = t / d) * t * t + b;
}

function getPosition(start, end, elapsed, duration) {
    if (elapsed > duration) {
        return end;
    }

    return easeInCubic(elapsed, start, end - start, duration);
}

function ScrollTo($element, direction, callback) {
    let startTime, animationFrame, duration, startPosition, snapItem, snapItemType;
    const scrollPropName = direction === 'v' ? 'scrollTop' : 'scrollLeft';

    function step(timestamp) {
        if (!startTime) {
            startTime = timestamp;
        }

        const elapsed = timestamp - startTime;

        if (!snapItem || !isNaN(snapItem.coord)) {
            $element[scrollPropName] = getPosition(
                startPosition,
                snapItem.coord,
                elapsed,
                duration
            );
        }

        if (elapsed < duration) {
            animationFrame = window.requestAnimationFrame(step);
        }
        else {
            if (typeof callback === 'function') {
                window.requestAnimationFrame(() => {
                    callback(snapItem, snapItemType);
                });
            }
        }
    }

    this.scrollTo = (item, type, _duration) => {
        if (!item) {
            return;
        }
        startTime = null;
        animationFrame = null;
        snapItem = item;
        snapItemType = type;
        startPosition = $element[scrollPropName];
        duration = typeof _duration !== 'undefined' ? _duration : Math.abs(snapItem.coord - startPosition); // ms

        animationFrame = window.requestAnimationFrame(step);
    }

    this.cancelAnimation = () => {
        window.cancelAnimationFrame(animationFrame);
    }
}

let defaultOptions = {
    lockedClass: 'locked',
    minItemsToActivate: 2,
    direction: 'h'
};

let hasIosBadScroll;

const TYPE_API = 'api';
const TYPE_SCROLL = 'scroll';

ScrollSnap = function($scroller, userOptions = {}) {
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
        areEventsBinded;

    const TIMEOUT_DELAY = 100;
    const STATE_IDLE = 'idle';
    const STATE_MOVING = 'moving';
    const STATE_LOCKED = 'locked';

    options = extend(defaultOptions, userOptions);

    const IS_VERTICAL_MODE = options.direction === 'v'
    const SCROLL_PROPERTY_NAME = IS_VERTICAL_MODE ? 'scrollTop' : 'scrollLeft'
    const SCROLL_SIZE_PROPERTY_NAME = IS_VERTICAL_MODE
        ? 'scrollHeight'
        : 'scrollWidth';

    hasSwipe = false;
    touchended = true;

    state = STATE_IDLE;

    minItemsToActivate = options.minItemsToActivate;

    // Store the coordinate and the DOM object of each item
    snapPoints = [];
    // Store the coordinate of the middle and the DOM object of each item
    halfSize = [];

    scrollToHandler = new ScrollTo($scroller, options.direction, resetState);

    function resetState(snapItem, type) {
        state = STATE_IDLE;

        currentSnapItem = snapItem;

        bindEvents();

        if (options.onSnapEnd) {
            options.onSnapEnd({
                $scroller,
                snapItem,
                type,
                scrollerSize,
                offsetSize
            });
        }

        processLimit( snapItem, type, true );
    }

    function getCurrentSection(scrollPos) {
        let len = halfSize.length;

        if (scrollPos <= 0) {
            return 0;
        }

        for (let i = 0; i < len; ++i) {
            if (scrollPos <= halfSize[i].coord) {
                return i;
            }
        }

        return len;
    }

    function cancelAutoScroll() {
        clearTimeout(scrollTimeoutId);
        scrollToHandler.cancelAnimation();
        window.cancelAnimationFrame(scrollTickTimeout);
    }

    function interuptAnimation() {
        off($scroller, {
            "eventsName": "wheel",
            "callback": interuptAnimation
        });
        cancelAutoScroll();
        state = STATE_IDLE;
    }

    function handleInterruption() {
        on($scroller, {
            "eventsName": "wheel",
            "callback": interuptAnimation
        });
    }

    /* Return true if the start or the end is reached */
    function processLimit( snapItem, type, fromResetState ) {

        if ( $scroller[SCROLL_SIZE_PROPERTY_NAME] - $scroller[SCROLL_PROPERTY_NAME] <= scrollerSize ) {
            if ( !fromResetState ) {
                resetState(snapItem, type);
            }

            if (options.onReachEnd) {
                options.onReachEnd({
                    $scroller,
                    snapItem,
                    type,
                    scrollerSize,
                    offsetSize
                });
            }
            return true;
        }
        else if ( $scroller[SCROLL_PROPERTY_NAME] === 0 )  {
            if ( !fromResetState ) {
                resetState(snapItem, type);
            }

            if ( options.onReachStart ) {
                options.onReachStart({
                    $scroller,
                    snapItem,
                    type,
                    scrollerSize,
                    offsetSize
                });
            }
            return true;
        }

        return false;
    }


    function processScroll() {
        let snapItem = snapPoints[getCurrentSection($scroller[SCROLL_PROPERTY_NAME])];

        if ( processLimit( snapItem, TYPE_SCROLL ) ) {
            return;
        }

        if (options.onSnapStart) {
            options.onSnapStart({
                $scroller,
                "snapItem": currentSnapItem,
                "type":     TYPE_SCROLL,
                scrollerSize,
                offsetSize
            });
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
        scrollTickTimeout = window.requestAnimationFrame(processScroll);
    }

    function onScroll() {
        if (state !== STATE_IDLE || !touchended) {
            return;
        }

        state = STATE_IDLE;

        cancelAutoScroll();

        scrollTimeoutId = setTimeout(debounceScroll, TIMEOUT_DELAY);
    }


    function removeEvents() {
        if (!areEventsBinded) {
            return;
        }

        areEventsBinded = false;
        off($scroller, {
            "eventsName": "scroll",
            "callback": onScroll
        });
        gestureOff($scroller, 'scrollSnapTouchSwipe');
    }


    function bindEvents() {
        if (areEventsBinded) {
            return;
        }

        areEventsBinded = true;

        on($scroller, {
            "eventsName": "scroll",
            "callback": onScroll
        });

        gesture($scroller, 'scrollSnapTouchSwipe', {
            "swipe": onSwipe,
            "start": onTouchstart,
            "end": onTouchend
        });
    }


    /**
     * Refresh the scroller and snap to the asked item
     *
     * @memberof ScrollSnap
     * @function refresh
     * @instance
     * @param {(HTMLElement[]|string)} snapItemsListOrSelector - Selector or DOMList of the items
     * @param {HTMLElement} [$itemToSnapOn] - Item to put on the left
     */
    this.refresh = ( snapItemsListOrSelector, $itemToSnapOn ) => {
        let propPos;

        if (!snapItemsListOrSelector) {
            snapItemsListOrSelector = options.snapTo;
        }
        else {
            options.snapTo = snapItemsListOrSelector;
        }

        propPos = IS_VERTICAL_MODE ? 'top' : 'left';
        offsetSize = 0;
        snapPoints.length = 0;
        halfSize.length = 0;
        currentSnapItem = null;
        TweenLite.set($scroller, { scrollTo: { x: 0, y: 0 } });

        if (snapItemsListOrSelector) {
            $snapItems =
                typeof options.snapTo === 'string'
                    ? $scroller.querySelectorAll(snapItemsListOrSelector)
                    : snapItemsListOrSelector;
        }

        if ($snapItems.length < minItemsToActivate) {
            state = STATE_LOCKED;
            removeEvents();
            aClass($scroller, options.lockedClass);
            return;
        }

        bindEvents();

        state = STATE_IDLE;
        rClass($scroller, options.lockedClass);

        if (options.$offsetElement) {
            offsetSize =
                prop(options.$offsetElement, 'margin-' + propPos) || 0;
            offsetSize = Math.round(parseFloat(offsetSize, 10));
        }

        scrollerSize = IS_VERTICAL_MODE ? height($scroller) : width($scroller);

        $snapItems.forEach(($item, index) => {
            let _position = position($item);
            let snapItem = {
                "coord": _position[propPos] - offsetSize,
                "index": index,
                "$item": $item
            };

            if ( $itemToSnapOn === $item ) {
                currentSnapItem = snapItem;
                if ( IS_VERTICAL_MODE ) {
                    TweenLite.set($scroller, { scrollTo: { x: 0, y: snapItem.coord } });
                }
                else {
                    TweenLite.set($scroller, { scrollTo: { x: snapItem.coord, y: 0 } });
                }
            }
            else if (!currentSnapItem) {
                currentSnapItem = snapItem;
            }

            snapPoints.push(snapItem);

            if (index) {
                halfSize.push({
                    "coord": Math.ceil(
                        snapPoints[index - 1].coord +
                            (_position[propPos] -
                                offsetSize -
                                snapPoints[index - 1].coord) /
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

        if (hasIosBadScroll !== undefined) {
            return;
        }

        scrollPos = $scroller[SCROLL_PROPERTY_NAME];

        setTimeout(() => {
            hasIosBadScroll = scrollPos === $scroller[SCROLL_PROPERTY_NAME]
        }, TIMEOUT_DELAY - 20);
    }

    function onTouchstart() {
        if (state === STATE_MOVING) {
            interuptAnimation();
        }
        hasSwipe = false;
        touchended = false;
        cancelAutoScroll();
    }

    function onTouchend() {
        if (state === STATE_MOVING) {
            return;
        }

        touchended = true;
        // Cancel scroll watching fired on touchmove,
        // Allow us to wait for the last scroll event fired one time at the end of the scrolling for bad iOS scroll behaviour
        cancelAutoScroll();
        if (!hasSwipe) {
            scrollTimeoutId = setTimeout(debounceScroll, TIMEOUT_DELAY);
        }
    }


    /**
     * Scroll to a specific index
     *
     * @memberof ScrollSnap
     * @function scrollToIndex
     * @instance
     *
     * @param {number} index
     * @param { number } [duration]
     */
    this.scrollToIndex = ( index, duration ) => {

        if (index < 0 || !snapPoints[index]) {
            return;
        }

        state = STATE_MOVING;

        removeEvents();
        onTouchstart();
        touchended = true;


        if (options.onSnapStart) {
            options.onSnapStart({
                $scroller,
                "snapItem": currentSnapItem,
                "type":     TYPE_API,
                scrollerSize,
                offsetSize
            });
        }

        scrollToHandler.scrollTo( snapPoints[index], TYPE_API, duration );
    }


    /**
     * Scroll to a specific item
     *
     * @memberof ScrollSnap
     * @function scrollToItem
     * @instance
     *
     * @param {HTMLElement} $item
     * @param { number } [duration]
     */
    this.scrollToItem = ( $item, duration ) => {
        let snapItem = snapPoints.find(snapPoint => snapPoint.$item === $item);

        if (!snapItem) {
            return;
        }

        state = STATE_MOVING;

        removeEvents();
        onTouchstart();
        touchended = true;

        currentSnapItem = snapItem;

        if (options.onSnapStart) {
            options.onSnapStart({
                $scroller,
                "snapItem": currentSnapItem,
                "type":     TYPE_API,
                scrollerSize,
                offsetSize
            });
        }

        if ( duration === 0 ) {
            if ( IS_VERTICAL_MODE ) {
                TweenLite.set($scroller, { scrollTo: { x: 0, y: snapItem.coord } });
            }
            else {
                TweenLite.set($scroller, { scrollTo: { x: snapItem.coord, y: 0 } });
            }
            wait().then( () => resetState(snapItem, TYPE_API) );
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
     * @param { number } [duration]
     */
    this.next = ( duration ) => {
        let nextIndex = currentSnapItem.index + 1;

        if (!snapPoints[nextIndex]) {
            return;
        }

        removeEvents();
        onTouchstart();
        touchended = true;

        state = STATE_MOVING;

        if (options.onSnapStart) {
            options.onSnapStart({
                $scroller,
                "snapItem": currentSnapItem,
                "type":     TYPE_API,
                scrollerSize,
                offsetSize
            });
        }

        scrollToHandler.scrollTo( snapPoints[nextIndex], TYPE_API, duration );
    }


    /**
     * Scroll to the previous item
     *
     * @memberof ScrollSnap
     * @function previous
     * @instance
     *
     * @param { number } [duration]
     */
    this.previous = ( duration ) => {
        let previousIndex = currentSnapItem.index - 1;

        if (previousIndex < 0 || !snapPoints[previousIndex]) {
            return;
        }

        removeEvents();
        onTouchstart();
        touchended = true;

        state = STATE_MOVING;

        if (options.onSnapStart) {
            options.onSnapStart({
                $scroller,
                "snapItem": currentSnapItem,
                "type":     TYPE_API,
                scrollerSize,
                offsetSize
            });
        }

        scrollToHandler.scrollTo( snapPoints[previousIndex], TYPE_API, duration );
    }


    /**
     * Destroy the scroller
     *
     * @memberof ScrollSnap
     * @function clean
     * @instance
     */
    this.clean = () => {
        cancelAutoScroll();
        off($scroller, {
            "eventsName": "scroll",
            "callback": onScroll
        });
        off($scroller, {
            "eventsName": "wheel",
            "callback": interuptAnimation
        });
        gestureOff($scroller, 'scrollSnapTouchSwipe');
    }

    this.refresh(options.snapTo);
}

}

export { ScrollSnap };
