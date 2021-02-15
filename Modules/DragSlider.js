import { wait }                   from '@creative-web-solution/front-library/Helpers/wait';
import { debounce }               from '@creative-web-solution/front-library/Helpers/debounce';
import { offset }                 from '@creative-web-solution/front-library/DOM/offset';
import { gesture, gestureOff }    from '@creative-web-solution/front-library/Events/Gesture';
import { prop }                   from '@creative-web-solution/front-library/DOM/Styles';
import { aClass, rClass, tClass } from '@creative-web-solution/front-library/DOM/Class';
import { on, off }                from '@creative-web-solution/front-library/Events/EventsManager';


/**
 * DragSlider
 * @class
 *
 * @param {HTMLElement} $slider
 * @param {Object} options
 * @param {String} options.viewportSelector
 * @param {String} options.listSelector
 * @param {String} options.itemSelector
 * @param {String} options.dragClass
 * @param {String} [options.lockedClass="is-locked"]
 * @param {Function} [options.onStartDrag]
 * @param {Function} [options.onDrag]
 * @param {Function} [options.onStopDrag]
 * @param {Function} [options.onSnap]
 * @param {Function} [options.onSnapUpdate]
 * @param {Function} [options.onMouseEnter]
 * @param {Function} [options.onMouseLeave]
 * @param {Function} [options.onInit]
 * @param {Function} [options.onChangeState]
 * @param {Number} [options.swipeTresholdMin=40] - in px
 * @param {Number} [options.swipeTresholdSize=0.5] - in % (0.5 = 50% of the size of one item)
 */
export function DragSlider( $slider, options ) {
    let itemMap, itemArray, listDelta, viewportInfo,
        $items, $list, $viewport, startDragCoords, deltaMove,
        currentSnapItem, firstItem,
        siteOffset,
        debouncedOnResize, isInitialized, hasAlreadyBeenDragged,
        isDragging, isDraggingActive;

    deltaMove = {
        "x": 0
    };

    isDraggingActive         = false;

    options.swipeTresholdMin  = options.swipeTresholdMin || 40;
    options.swipeTresholdSize = options.swipeTresholdSize || 0.5;
    options.lockedClass       = options.lockedClass || 'is-locked';

    itemArray = [];


    Object.defineProperty( this, 'isActive', {
        "get": () => isDraggingActive
    } );


    function cancelLinkClick() {
        aClass( $slider, options.dragClass );
    }


    function activeLinkClick() {
        wait().then( () => {
            rClass( $slider, options.dragClass );
        } );
    }


    function onResize() {
        viewportInfo     = offset( $viewport );
        siteOffset       = parseInt( prop( $items[ 0 ], 'marginLeft' ), 10 );
        listDelta        = viewportInfo.width - $list.scrollWidth;

        const prevIsDraggingActive = isDraggingActive;
        isDraggingActive = listDelta < 0;

        if ( !isDraggingActive ) {
            isDragging = false;
            gsap.killTweensOf( $list );
            gsap.set( $list, {
                "x": 0,
                "y": 0,
                "z": 0
            } );
        }

        tClass( $slider, options.lockedClass, !isDraggingActive );

        if ( prevIsDraggingActive !== isDraggingActive ) {
            options.onChangeState?.( isDraggingActive );
        }

        itemArray.length = 0;

        $items.forEach( ( $item, index ) => {
            const ITEM_OFFSET = offset( $item, false, $list );

            itemArray.push({
                index,
                "isFirst": index === 0,
                "isLast":  index === $items.length - 1 || ITEM_OFFSET.left > Math.abs( listDelta ),
                $item,
                "info": ITEM_OFFSET
            });

            itemMap.set( $item, itemArray[ index ] );
        } );

        firstItem = itemMap.get( $items[ 0 ] );

        if ( !currentSnapItem ) {
            currentSnapItem = firstItem;
        }
        else {
            currentSnapItem = itemArray[ currentSnapItem.index ];
        }
    }


    function snapToItemAnimation( snapItem, snapToEnd ) {
        let finalX;

        if ( snapToEnd ) {
            finalX = listDelta;
        }
        else {
            finalX = -1 * snapItem.info.left + siteOffset;

            finalX = Math.max( Math.min( 0, finalX ), listDelta );

            // If close to the end, then snap to it
            if ( Math.abs( finalX - listDelta ) <= 3 ) {
                finalX = listDelta;
            }
        }

        const IS_SNAP_TO_END   = finalX === listDelta;
        const IS_SNAP_TO_START = finalX === 0;

        options.onSnap?.( {
            "item":        snapItem,
            "xPos":        deltaMove.x,
            "moveMaxSize": listDelta,
            "isAtStart":   IS_SNAP_TO_START,
            "isAtEnd":     IS_SNAP_TO_END
        } );

        gsap.to( $list, {
            "duration": 0.3,
            "x":        finalX,
            "y":        0,
            "z":        0,
            "onUpdate": function() {
                deltaMove.x = gsap.getProperty( this.targets()[ 0 ], 'x' );

                options.onSnapUpdate?.( {
                    "item":        snapItem,
                    "xPos":        deltaMove.x,
                    "moveMaxSize": listDelta,
                    "isAtStart":   IS_SNAP_TO_START,
                    "isAtEnd":     IS_SNAP_TO_END
                } );
            }
        } );

        currentSnapItem = snapItem;
    }


    function getFirstPreviousItem( xPos ) {
        let snapItem;

        const absXPos = Math.abs( xPos );

        for ( const item of itemArray ) {
            if ( item.info.left <= absXPos ) {
                snapItem  = item;
                continue;
            }
            break;
        }

        return {
            snapItem,
            "snapToEnd": false
        };
    }


    function getFirstNextItem( xPos ) {
        let lastDelta, snapItem, snapToEnd;

        const absXPos = Math.abs( xPos );

        for ( const item of itemArray ) {
            if ( item.info.left < absXPos ) {
                continue;
            }

            lastDelta = Math.abs( absXPos - item.info.left );
            snapItem  = item;
            break;
        }

        const lastItem = itemArray[ itemArray.length - 1 ];

        if ( !snapItem.isLast &&
            Math.abs( absXPos + viewportInfo.width - ( lastItem.info.left + lastItem.info.width ) ) < lastDelta
        ) {
            snapItem = lastItem;
            snapToEnd = true;
        }

        return {
            snapItem,
            snapToEnd
        };
    }


    function getClosestItem( xPos ) {
        let lastDelta, snapItem, snapToEnd;

        const absXPos = Math.abs( xPos );

        for ( const item of itemArray ) {
            const IS_LAST_DELTA = typeof lastDelta !== 'undefined';
            let newDelta = Math.abs( absXPos - item.info.left );

            if ( !IS_LAST_DELTA || newDelta < lastDelta ) {
                lastDelta = newDelta;
                snapItem = item;
            }

            if ( !IS_LAST_DELTA ) {
                continue;
            }

            if ( !snapItem.isLast && item.index === itemMap.size - 1 ) {
                newDelta = Math.abs( Math.abs( deltaMove.x ) + viewportInfo.width - ( item.info.left + item.info.width ) );

                if ( newDelta < lastDelta ) {
                    lastDelta = newDelta;
                    snapItem = item;
                    snapToEnd = true;
                }
            }
        }

        return {
            snapItem,
            snapToEnd
        };
    }


    function snapToItem() {
        let snapItem;

        const ABS_DELTA_X = Math.abs( deltaMove.deltaX );

        if ( ABS_DELTA_X >= options.swipeTresholdMin && ABS_DELTA_X < Math.min( firstItem.info.width * options.swipeTresholdSize, options.swipeTresholdMin * 3 ) ) {
            if ( deltaMove.deltaX < 0 ) {
                snapItem = getFirstNextItem( deltaMove.x );
            }
            else {
                snapItem = getFirstPreviousItem( deltaMove.x );
            }
        }
        else {
            snapItem = getClosestItem( deltaMove.x );
        }

        if ( !snapItem ) {
            return;
        }

        snapToItemAnimation( snapItem.snapItem, snapItem.snapToEnd );
    }


    function onStartDrag( e, $target, coords ) {
        if ( !hasAlreadyBeenDragged ) {
            onResize();
            hasAlreadyBeenDragged = true;
        }

        if ( !isDraggingActive ) {
            return;
        }

        isDragging = true;

        gsap.killTweensOf( $list );

        startDragCoords = coords;
        listDelta       = viewportInfo.width - $list.scrollWidth;

        gesture( document.body, 'dragSlider', {
            "move":        onMove,
            "end":         onStopDrag,
            "preventMove": function( e ) {
                if ( !e.cancelable ) {
                    return false;
                }

                return !Modernizr.touchdevice ||
                        Modernizr.touchdevice && Math.abs( deltaMove.deltaY ) < Math.abs( deltaMove.deltaX );
            }
        } );

        options.onStartDrag?.( {
            "item":        currentSnapItem,
            "xPos":        deltaMove.x,
            "moveMaxSize": listDelta,
            "isAtStart":   deltaMove.x === 0,
            "isAtEnd":     deltaMove.x === listDelta
        } );
    }


    function onMove( e, $target, coords ) {
        cancelLinkClick();

        deltaMove.deltaX = coords.pageX - startDragCoords.pageX;
        deltaMove.deltaY = coords.pageY - startDragCoords.pageY;

        deltaMove.newX  = deltaMove.deltaX + deltaMove.x;

        if ( deltaMove.newX > 0 ) {
            deltaMove.newX = 0;
        }
        else if ( deltaMove.newX < listDelta ) {
            deltaMove.newX = listDelta;
        }

        gsap.set( $list, {
            "x": deltaMove.newX,
            "y": 0,
            "z": 0
        } );

        options.onDrag?.( {
            "item":        currentSnapItem,
            "xPos":        deltaMove.newX,
            "moveMaxSize": listDelta,
            "isAtStart":   deltaMove.newX === 0,
            "isAtEnd":     deltaMove.newX === listDelta
        } );
    }


    function onStopDrag() {
        gestureOff( document.body, 'dragSlider', {
            "move":  onMove,
            "end":   onStopDrag
        } );

        isDragging = false;

        deltaMove.x = deltaMove.newX;

        activeLinkClick();

        snapToItem();

        options.onStopDrag?.({
            "item":        currentSnapItem,
            "xPos":        deltaMove.x,
            "moveMaxSize": listDelta,
            "isAtStart":   deltaMove.x === 0,
            "isAtEnd":     deltaMove.x === listDelta
        } );
    }


    function onMouseenter() {
        if ( isDragging || !isDraggingActive ) {
            return;
        }

        options.onMouseEnter?.( {
            "item":        currentSnapItem,
            "xPos":        deltaMove.x,
            "moveMaxSize": listDelta,
            "isAtStart":   deltaMove.x === 0,
            "isAtEnd":     deltaMove.x === listDelta
        } );
    }


    function onMouseleave() {
        if ( isDragging || !isDraggingActive ) {
            return;
        }

        options.onMouseLeave?.( {
            "item":        currentSnapItem,
            "xPos":        deltaMove.x,
            "moveMaxSize": listDelta,
            "isAtStart":   deltaMove.x === 0,
            "isAtEnd":     deltaMove.x === listDelta
        } );
    }


    function cancelDrag( e ) {
        e.preventDefault();
    }


    this.next = () => {
        if ( !isDraggingActive || currentSnapItem.isLast ) {
            return;
        }

        snapToItemAnimation( itemArray[ currentSnapItem.index + 1 ] );
    }


    this.previous = () => {
        if ( !isDraggingActive || currentSnapItem.isFirst ) {
            return;
        }

        snapToItemAnimation( itemArray[ currentSnapItem.index - 1 ] );
    }


    this.goToItem = $block => {

        if ( !isDraggingActive ) {
            return;
        }

        const ITEM = itemMap.get( $block );

        if ( !ITEM ) {
            return;
        }

        options.onSnap?.( {
            "item":        ITEM,
            "xPos":        deltaMove.x,
            "moveMaxSize": listDelta,
            "isAtStart":   deltaMove.x === 0,
            "isAtEnd":     deltaMove.x === listDelta
        } );

        gsap.to( $list, {
            "duration": 0.3,
            "x":        -1 * ITEM.info.left + siteOffset,
            "y":        0,
            "z":        0,
            "onUpdate": function() {
                deltaMove.x = gsap.getProperty( this.targets()[ 0 ], 'x' );

                options.onSnapUpdate?.( {
                    "item":        ITEM,
                    "xPos":        deltaMove.x,
                    "moveMaxSize": listDelta,
                    "isAtStart":   deltaMove.x === 0,
                    "isAtEnd":     deltaMove.x === listDelta
                } );
            }
        } );
    };


    this.init = () => {
        if ( isInitialized ) {
            return;
        }

        isInitialized = true;

        if ( !$viewport ) {
            itemMap           = new Map();

            $viewport         = $slider.querySelector( options.viewportSelector );
            $list             = $viewport.querySelector( options.listSelector );
            $items            = $list.querySelectorAll( options.itemSelector );
            debouncedOnResize = debounce( onResize );
        }

        if ( !$items.length ) {
            return;
        }

        onResize();

        on( window, {
            "eventsName": "resize",
            "callback":    debouncedOnResize
        } );

        gesture( $viewport, 'dragSlider', {
            "start": onStartDrag
        } );

        // Avoid image or content drag on Firefox
        on( $items, {
            "eventsName": "dragstart",
            "callback":   cancelDrag
        } );

        on( $viewport, {
            "eventsName": "mouseenter",
            "callback":   onMouseenter
        } );

        on( $viewport, {
            "eventsName": "mouseleave",
            "callback":   onMouseleave
        } );

        options.onInit?.( {
            "item":        currentSnapItem,
            "xPos":        deltaMove.x,
            "moveMaxSize": listDelta,
            "isAtStart":   deltaMove.x === 0,
            "isAtEnd":     deltaMove.x === listDelta
        } );

        aClass( $slider, 'is-active' );
    }


    this.destroy = () => {

        isInitialized         = false;
        hasAlreadyBeenDragged = false;

        if ( !$items.length ) {
            return;
        }

        off( window, {
            "eventsName": "resize",
            "callback":    debouncedOnResize
        } );

        gestureOff( $viewport, 'dragSlider', {
            "start": onStartDrag
        } );

        gestureOff( document.body, 'dragSlider', {
            "move":  onMove,
            "end":   onStopDrag
        } );

        off( $items, {
            "eventsName": "dragstart",
            "callback":   cancelDrag
        } );

        off( $viewport, {
            "eventsName": "mouseenter",
            "callback":   onMouseenter
        } );

        off( $viewport, {
            "eventsName": "mouseleave",
            "callback":   onMouseleave
        } );


        gsap.killTweensOf( $list );

        gsap.set( $list, {
            "clearProps": "all"
        } );

        rClass( $viewport, options.dragClass );

        rClass( $slider, 'is-active' );
    }


    wait( 'idle' ).then( this.init );
}
