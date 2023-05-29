import { wait }                    from '../Helpers/Wait';
import { debounce }                from '../Helpers/Debounce';
import { offset }                  from '../DOM/Offset';
import { gesture, gestureOff }     from '../Events/Gesture';
import { prop }                    from '../DOM/Styles';
import { aClass, rClass, tClass }  from '../DOM/Class';
import { on, off }                 from '../Events/EventsManager';
import { isTouchDevice }           from '../Tools/TouchDeviceSupport';
import { copy }                    from '../Helpers/Extend';


/**
 * DragSlider
 */
export default class DragSlider {
    #isDraggingActive:      boolean;
    #options:               FLib.DragSlider.Options;
    #deltaMove:             FLib.DragSlider.DeltaMove;
    #itemArray:             FLib.DragSlider.Item[];
    #$slider:               HTMLElement;
    #viewportInfo;
    #siteOffset;
    #listDelta               = 0;
    #$viewport:              HTMLElement | undefined;
    #$items:                 NodeList | undefined;
    #$list:                  HTMLElement | undefined;
    #isDragging              = false;
    #itemMap                 = new Map<HTMLElement, FLib.DragSlider.Item>();
    #firstItem:              FLib.DragSlider.Item | undefined;
    #currentSnapItem:        FLib.DragSlider.Item | undefined;
    #hasAlreadyBeenDragged   = false;
    #startDragCoords:        FLib.Events.Gesture.Coords | undefined;
    #isInitialized           = false;
    #debouncedOnResize;


    get isActive(): boolean {
        return this.#isDraggingActive;
    }


    constructor( $slider: HTMLElement, options: Partial<FLib.DragSlider.Options> ) {

        if ( !options.viewportSelector || !options.listSelector || !options.itemSelector || !options.dragClass ) {
            throw '[Drag Slider]: Missing at least one of viewportSelector, listSelector, itemSelector, dragClass';
        }

        this.#deltaMove = {
            "x":      0,
            "deltaX": 0,
            "deltaY": 0,
            "newX":   0
        };

        this.#$slider = $slider;

        this.#isDraggingActive = false;

        this.#options = copy( options );

        this.#options.swipeTresholdMin  = options.swipeTresholdMin || 40;
        this.#options.swipeTresholdSize = options.swipeTresholdSize || 0.5;
        this.#options.lockedClass       = options.lockedClass || 'is-locked';

        this.#itemArray = [];

        wait( 'idle' ).then( this.init );
    }


    #cancelLinkClick = (): void => {
        aClass( this.#$slider, this.#options.dragClass );
    }


    #activeLinkClick = (): void => {
        wait().then( () => {
            rClass( this.#$slider, this.#options.dragClass );
        } );
    }


    #onResize = (): void => {
        if ( !this.#$items || !this.#$list ) {
            return;
        }
        this.#viewportInfo = offset( this.#$viewport as HTMLElement );
        this.#siteOffset   = parseInt( prop( (this.#$items[ 0 ] as HTMLElement), 'marginLeft' ), 10 );
        this.#listDelta    = this.#viewportInfo.width - this.#$list.scrollWidth;

        const prevIsDraggingActive = this.#isDraggingActive;
        this.#isDraggingActive     = this.#listDelta < 0;

        if ( !this.#isDraggingActive ) {
            this.#isDragging = false;
            gsap.killTweensOf( this.#$list );
            gsap.set( this.#$list, {
                "x": 0,
                "y": 0,
                "z": 0
            } );
        }

        tClass( this.#$slider, this.#options.lockedClass, !this.#isDraggingActive );

        if ( prevIsDraggingActive !== this.#isDraggingActive ) {
            this.#options.onChangeState?.( this.#isDraggingActive );
        }

        this.#itemArray.length = 0;

        const LAST_INDEX = this.#$items.length;

        this.#$items.forEach( ( $item: Node, index: number ) => {
            const $ITEM       = $item as HTMLElement;
            const ITEM_OFFSET = offset( $ITEM, false, this.#$list );

            this.#itemArray.push({
                index,
                "isFirst": index === 0,
                "isLast":  index === LAST_INDEX - 1 || ITEM_OFFSET.left > Math.abs( this.#listDelta ),
                "$item":   $ITEM,
                "info":    ITEM_OFFSET
            });

            this.#itemMap.set( $ITEM, this.#itemArray[ index ] );
        } );

        this.#firstItem = this.#itemMap.get( (this.#$items[ 0 ] as HTMLElement) ) as FLib.DragSlider.Item;

        if ( !this.#currentSnapItem ) {
            this.#currentSnapItem = this.#firstItem;
        }
        else {
            this.#currentSnapItem = this.#itemArray[ this.#currentSnapItem.index ];
        }
    }


    #snapToItemAnimation = ( snapItem: FLib.DragSlider.Item, snapToEnd?: FLib.DragSlider.Item ): gsap.core.Tween => {
        let finalX;

        if ( snapToEnd ) {
            finalX = this.#listDelta;
        }
        else {
            finalX = -1 * snapItem.info.left + this.#siteOffset;

            finalX = Math.max( Math.min( 0, finalX ), this.#listDelta );

            // If close to the end, then snap to it
            if ( Math.abs( finalX - this.#listDelta ) <= 3 ) {
                finalX = this.#listDelta;
            }

            // If close to the start, then snap to it
            if ( Math.abs( finalX ) <= 3 ) {
                finalX = 0;
            }
        }

        const IS_SNAP_TO_END   = finalX === this.#listDelta;
        const IS_SNAP_TO_START = finalX === 0;

        this.#options.onSnap?.( {
            "item":        snapItem,
            "xPos":        this.#deltaMove.x,
            "moveMaxSize": this.#listDelta,
            "isAtStart":   IS_SNAP_TO_START,
            "isAtEnd":     IS_SNAP_TO_END
        } );

        this.#currentSnapItem = snapItem;

        const TWEEN = gsap.to( this.#$list as HTMLElement, {
            "duration": 0.3,
            "x":        finalX,
            "y":        0,
            "z":        0,
            "onUpdateParams": [ this ],
            "onUpdate": function( ctx ) {
                ctx.#deltaMove.x = gsap.getProperty( this.targets()[ 0 ], 'x' ) as number;

                ctx.#options.onSnapUpdate?.( {
                    "item":        snapItem,
                    "xPos":        ctx.#deltaMove.x,
                    "moveMaxSize": ctx.#listDelta,
                    "isAtStart":   IS_SNAP_TO_START,
                    "isAtEnd":     IS_SNAP_TO_END
                } );
            }
        } );

        return TWEEN
    }


    #getFirstPreviousItem = ( xPos: number ): { snapItem: FLib.DragSlider.Item, snapToEnd: boolean } => {
        let snapItem;

        const absXPos = Math.abs( xPos );

        for ( const item of this.#itemArray ) {
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


    #getFirstNextItem = ( xPos: number ): { snapItem: FLib.DragSlider.Item, snapToEnd: boolean } => {
        let lastDelta, snapItem, snapToEnd;

        const absXPos = Math.abs( xPos );

        for ( const item of this.#itemArray ) {
            if ( item.info.left < absXPos ) {
                continue;
            }

            lastDelta = Math.abs( absXPos - item.info.left );
            snapItem  = item;
            break;
        }

        const lastItem = this.#itemArray[ this.#itemArray.length - 1 ];

        if ( !snapItem.isLast &&
            Math.abs( absXPos + this.#viewportInfo.width - ( lastItem.info.left + lastItem.info.width ) ) < lastDelta
        ) {
            snapItem = lastItem;
            snapToEnd = true;
        }

        return {
            snapItem,
            snapToEnd
        };
    }


    #getClosestItem = ( xPos: number ): { snapItem: FLib.DragSlider.Item, snapToEnd: boolean } => {
        let lastDelta, snapItem, snapToEnd = false;

        const absXPos = Math.abs( xPos );

        for ( const item of this.#itemArray ) {
            const IS_LAST_DELTA = typeof lastDelta !== 'undefined';
            let newDelta = Math.abs( absXPos - item.info.left );

            if ( !IS_LAST_DELTA || newDelta < lastDelta ) {
                lastDelta = newDelta;
                snapItem  = item;
            }

            if ( !IS_LAST_DELTA ) {
                continue;
            }

            if ( !snapItem.isLast && item.index === this.#itemMap.size - 1 ) {
                newDelta = Math.abs( Math.abs( this.#deltaMove.x ) + this.#viewportInfo.width - ( item.info.left + item.info.width ) );

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


    #snapToItem = (): void => {
        let snapItem;

        const ABS_DELTA_X = Math.abs( this.#deltaMove.deltaX );

        if ( ABS_DELTA_X >= this.#options.swipeTresholdMin && ABS_DELTA_X < Math.min( (this.#firstItem as FLib.DragSlider.Item ).info.width * this.#options.swipeTresholdSize, this.#options.swipeTresholdMin * 3 ) ) {
            if ( this.#deltaMove.deltaX < 0 ) {
                snapItem = this.#getFirstNextItem( this.#deltaMove.x );
            }
            else {
                snapItem = this.#getFirstPreviousItem( this.#deltaMove.x );
            }
        }
        else {
            snapItem = this.#getClosestItem( this.#deltaMove.x );
        }

        if ( !snapItem ) {
            return;
        }

        this.#snapToItemAnimation( snapItem.snapItem, snapItem.snapToEnd );
    }


    #onStartDrag = ( e: Event, $target: HTMLElement, coords: FLib.Events.Gesture.Coords ): void => {
        if ( !this.#hasAlreadyBeenDragged ) {
            this.#onResize();
            this.#hasAlreadyBeenDragged = true;
        }

        if ( !this.#isDraggingActive || !this.#$list ) {
            return;
        }

        this.#isDragging = true;

        gsap.killTweensOf( this.#$list );

        this.#startDragCoords = coords;
        this.#listDelta       = this.#viewportInfo.width - this.#$list.scrollWidth;

        gesture( document.body, 'dragSlider', {
            "move":        this.#onMove,
            "end":         this.#onStopDrag,
            "preventMove": e => {
                if ( !e.cancelable ) {
                    return false;
                }

                return !isTouchDevice ||
                        isTouchDevice && Math.abs( this.#deltaMove.deltaY ) < Math.abs( this.#deltaMove.deltaX );
            }
        } );

        this.#options.onStartDrag?.( {
            "item":        this.#currentSnapItem,
            "xPos":        this.#deltaMove.x,
            "moveMaxSize": this.#listDelta,
            "isAtStart":   this.#deltaMove.x === 0,
            "isAtEnd":     this.#deltaMove.x === this.#listDelta
        } );
    }


    #onMove = ( e: Event, $target: HTMLElement, coords: FLib.Events.Gesture.Coords ): void => {
        this.#cancelLinkClick();

        this.#deltaMove.deltaX = coords.pageX - ( this.#startDragCoords as FLib.Events.Gesture.Coords ).pageX;
        this.#deltaMove.deltaY = coords.pageY - ( this.#startDragCoords as FLib.Events.Gesture.Coords ).pageY;

        this.#deltaMove.newX  = this.#deltaMove.deltaX + this.#deltaMove.x;

        if ( this.#deltaMove.newX > 0 ) {
            this.#deltaMove.newX = 0;
        }
        else if ( this.#deltaMove.newX < this.#listDelta ) {
            this.#deltaMove.newX = this.#listDelta;
        }

        gsap.set( this.#$list as HTMLElement, {
            "x": this.#deltaMove.newX,
            "y": 0,
            "z": 0
        } );

        this.#options.onDrag?.( {
            "item":        this.#currentSnapItem,
            "xPos":        this.#deltaMove.newX,
            "moveMaxSize": this.#listDelta,
            "isAtStart":   this.#deltaMove.newX === 0,
            "isAtEnd":     this.#deltaMove.newX === this.#listDelta
        } );
    }


    #onStopDrag = (): void => {
        gestureOff( document.body, 'dragSlider' );

        this.#isDragging = false;

        this.#deltaMove.x = this.#deltaMove.newX;

        this.#activeLinkClick();

        this.#snapToItem();

        this.#options.onStopDrag?.({
            "item":        this.#currentSnapItem,
            "xPos":        this.#deltaMove.x,
            "moveMaxSize": this.#listDelta,
            "isAtStart":   this.#deltaMove.x === 0,
            "isAtEnd":     this.#deltaMove.x === this.#listDelta
        } );
    }


    #onMouseenter = (): void => {
        if ( this.#isDragging || !this.#isDraggingActive ) {
            return;
        }

        this.#options.onMouseEnter?.( {
            "item":        this.#currentSnapItem,
            "xPos":        this.#deltaMove.x,
            "moveMaxSize": this.#listDelta,
            "isAtStart":   this.#deltaMove.x === 0,
            "isAtEnd":     this.#deltaMove.x === this.#listDelta
        } );
    }


    #onMouseleave = (): void => {
        if ( this.#isDragging || !this.#isDraggingActive ) {
            return;
        }

        this.#options.onMouseLeave?.( {
            "item":        this.#currentSnapItem,
            "xPos":        this.#deltaMove.x,
            "moveMaxSize": this.#listDelta,
            "isAtStart":   this.#deltaMove.x === 0,
            "isAtEnd":     this.#deltaMove.x === this.#listDelta
        } );
    }


    #cancelDrag = ( e: Event ): void => {
        e.preventDefault();
    }


    next(): gsap.core.Tween | void {
        if ( !this.#isDraggingActive || ( this.#currentSnapItem as FLib.DragSlider.Item ).isLast ) {
            return;
        }

        return this.#snapToItemAnimation( this.#itemArray[ ( this.#currentSnapItem as FLib.DragSlider.Item ).index + 1 ] );
    }


    previous(): gsap.core.Tween | void {
        if ( !this.#isDraggingActive || ( this.#currentSnapItem as FLib.DragSlider.Item ).isFirst ) {
            return;
        }

        return this.#snapToItemAnimation( this.#itemArray[ ( this.#currentSnapItem as FLib.DragSlider.Item ).index - 1 ] );
    }


    goToItem( $block: HTMLElement ): gsap.core.Tween | void {

        if ( !this.#isDraggingActive ) {
            return;
        }

        const ITEM = this.#itemMap.get( $block );

        if ( !ITEM ) {
            return;
        }

        this.#options.onSnap?.( {
            "item":        ITEM,
            "xPos":        this.#deltaMove.x,
            "moveMaxSize": this.#listDelta,
            "isAtStart":   this.#deltaMove.x === 0,
            "isAtEnd":     this.#deltaMove.x === this.#listDelta
        } );

        return gsap.to( this.#$list as HTMLElement, {
            "duration": 0.3,
            "x":        -1 * ITEM.info.left + this.#siteOffset,
            "y":        0,
            "z":        0,
            "onUpdateParams": [ this ],
            "onUpdate": function( ctx ) {

                ctx.#deltaMove.x = gsap.getProperty( this.targets()[ 0 ], 'x' ) as number;

                ctx.#options.onSnapUpdate?.( {
                    "item":        ITEM,
                    "xPos":        ctx.#deltaMove.x,
                    "moveMaxSize": ctx.#listDelta,
                    "isAtStart":   ctx.#deltaMove.x === 0,
                    "isAtEnd":     ctx.#deltaMove.x === ctx.#listDelta
                } );
            }
        } );
    }


    init = (): this => {
        if ( this.#isInitialized ) {
            return this;
        }

        this.#isInitialized = true;

        if ( !this.#$viewport ) {
            const $VP = this.#$slider.querySelector( this.#options.viewportSelector );
            if ( !$VP ) {
                throw `"${ this.#options.viewportSelector }" not found`;
            }
            this.#$viewport         = $VP as HTMLElement;

            const $LST = this.#$viewport.querySelector( this.#options.listSelector );
            if ( !$LST ) {
                throw `"${ this.#options.listSelector }" not found`;
            }
            this.#$list             = $LST as HTMLElement;

            const $ITEMS = this.#$list.querySelectorAll( this.#options.itemSelector );
            if ( !$ITEMS ) {
                throw `"${ this.#options.itemSelector }" not found`;
            }
            this.#$items            = $ITEMS as NodeList;

            this.#debouncedOnResize = debounce( this.#onResize );
        }

        if ( !this.#$items?.length ) {
            return this;
        }

        this.#onResize();

        on( window, {
            "eventsName": "resize",
            "callback":    this.#debouncedOnResize
        } );

        gesture( this.#$viewport, 'dragSlider', {
            "start": this.#onStartDrag
        } );

        // Avoid image or content drag on Firefox
        on( this.#$items, {
            "eventsName": "dragstart",
            "callback":   this.#cancelDrag
        } );

        on( this.#$viewport, {
            "eventsName": "mouseenter",
            "callback":   this.#onMouseenter
        } );

        on( this.#$viewport, {
            "eventsName": "mouseleave",
            "callback":   this.#onMouseleave
        } );

        this.#options.onInit?.( {
            "item":        this.#currentSnapItem,
            "xPos":        this.#deltaMove.x,
            "moveMaxSize": this.#listDelta,
            "isAtStart":   this.#deltaMove.x === 0,
            "isAtEnd":     this.#deltaMove.x === this.#listDelta
        } );

        aClass( this.#$slider, 'is-active' );

        return this;
    }


    destroy(): this {
        this.#isInitialized         = false;
        this.#hasAlreadyBeenDragged = false;

        if ( !this.#$items?.length ) {
            return this;
        }

        off( window, {
            "eventsName": "resize",
            "callback":    this.#debouncedOnResize
        } );

        this.#$viewport && gestureOff( this.#$viewport, 'dragSlider' );

        gestureOff( document.body, 'dragSlider' );

        off( this.#$items, {
            "eventsName": "dragstart",
            "callback":   this.#cancelDrag
        } );

        off( this.#$viewport, {
            "eventsName": "mouseenter",
            "callback":   this.#onMouseenter
        } );

        off( this.#$viewport, {
            "eventsName": "mouseleave",
            "callback":   this.#onMouseleave
        } );

        if ( this.#$list ) {
            gsap.killTweensOf( this.#$list );

            gsap.set( this.#$list, {
                "clearProps": "all"
            } );
        }

        this.#$viewport && rClass( this.#$viewport, this.#options.dragClass );

        rClass( this.#$slider, 'is-active' );

        return this;
    }

}
