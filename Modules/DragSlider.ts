import { wait }                    from '../Helpers/Wait';
import { debounce }                from '../Helpers/Debounce';
import { offset }                  from '../DOM/Offset';
import { gesture, gestureOff }     from '../Events/Gesture';
import { prop }                    from '../DOM/Styles';
import { aClass, rClass, tClass }  from '../DOM/Class';
import { on, off }                 from '../Events/EventsManager';
import { isTouchDevice }           from '../Tools/TouchDeviceSupport';
import { extend }                  from '../Helpers/Extend';

const defaultOptions = {
    swipeTresholdMin: 40,
    swipeTresholdSize: 0.5,
    lockedClass: 'is-locked',
    _animReset: function($list) {
        gsap.set( $list, {
            "x": 0,
            "y": 0,
            "z": 0
        } );
    },
    _animClear: function($list) {
        gsap.set( $list, {
            "clearProps": "all"
        } );
    },
    _animKill: function($list) {
        gsap.killTweensOf( $list );
    },
    _animMoveItem: function($list, x, onUpdate) {
        return gsap.to( $list, {
            "duration": 0.3,
            "x":        x,
            "y":        0,
            "z":        0,
            "onUpdate": function() {
                onUpdate(gsap.getProperty( this.targets()[ 0 ], 'x' ));
            }
        } );
    },
    _setCoordinates: function($list, x) {
        gsap.set( $list, {
            "x": x,
            "y": 0,
            "z": 0
        } );
    }
}

/**
 * DragSlider
 */
export default class DragSlider {
    #isDraggingActive:      boolean;
    #options:               FLib.DragSlider.Options;
    #deltaMove:             FLib.DragSlider.DeltaMove = {
        "x":      0,
        "deltaX": 0,
        "deltaY": 0,
        "newX":   0
    };
    #itemArray:             FLib.DragSlider.Item[];
    #$slider:               HTMLElement;
    #viewportInfo;
    #siteOffsetLeft          = 0;
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


    get count(): number {
        return this.#$items?.length ?? 0;
    }

    get currentSnapItem(): FLib.DragSlider.Item | undefined {
        return this.#currentSnapItem;
    }

    get isActive(): boolean {
        return this.#isDraggingActive;
    }

    get items(): NodeList | undefined {
        return this.#$items;
    }


    constructor( $slider: HTMLElement, userOptions: Partial<FLib.DragSlider.Options> ) {

        if ( !userOptions.viewportSelector || !userOptions.listSelector || !userOptions.itemSelector || !userOptions.dragClass ) {
            throw '[Drag Slider]: Missing at least one of viewportSelector, listSelector, itemSelector, dragClass';
        }

        this.#$slider = $slider;

        this.#isDraggingActive = false;

        this.#options = extend( defaultOptions, userOptions );

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

        this.#viewportInfo    = offset( this.#$viewport as HTMLElement );
        this.#siteOffsetLeft  = parseInt( prop( (this.#$items[ 0 ] as HTMLElement), 'marginLeft' ), 10 );

        this.#listDelta    = this.#viewportInfo.width - this.#$list.scrollWidth;

        const prevIsDraggingActive = this.#isDraggingActive;
        this.#isDraggingActive     = this.#listDelta < 0;

        if ( !this.#isDraggingActive ) {
            this.#isDragging = false;
            this.#options._animKill( this.#$list );
            this.#options._animReset( this.#$list );
        }

        tClass( this.#$slider, this.#options.lockedClass, !this.#isDraggingActive );

        if ( prevIsDraggingActive !== this.#isDraggingActive ) {
            this.#options.onChangeState?.( this.#isDraggingActive );
        }

        this.#itemArray.length = 0;
        const ABS_LIST_DELTA = Math.abs( this.#listDelta );

        for (let index = 0; index < this.#$items.length; ++index) {
            const $ITEM       = this.#$items[ index ] as HTMLElement;
            const ITEM_OFFSET = offset( $ITEM, false, this.#$list );

            if (ITEM_OFFSET.left - this.#siteOffsetLeft <= ABS_LIST_DELTA) {
                this.#itemArray.push({
                    index,
                    "isFirst": index === 0,
                    "isLast":  false,
                    "$item":   $ITEM,
                    "info":    ITEM_OFFSET
                });

                this.#itemMap.set( $ITEM, this.#itemArray[ index ] );
                continue;
            }

            this.#itemArray.push({
                index,
                "isFirst": index === 0,
                "isLast":  true,
                "$item":   $ITEM,
                "info":    {
                    ...ITEM_OFFSET,
                    "left": ABS_LIST_DELTA + this.#siteOffsetLeft,
                    "x":    ABS_LIST_DELTA + this.#siteOffsetLeft
                }
            });
            this.#itemMap.set( $ITEM, this.#itemArray[ index ] );

            break;
        }

        this.#firstItem = this.#itemMap.get( (this.#$items[ 0 ] as HTMLElement) ) as FLib.DragSlider.Item;

        if ( !this.#currentSnapItem ) {
            this.#currentSnapItem = this.#firstItem;
        }
        else {
            this.#currentSnapItem = this.#itemArray[ this.#currentSnapItem.index ];
        }
    }


    #snapToItemAnimation =  ( snapItem: FLib.DragSlider.Item ): Promise<any> | void => {
        if (!snapItem) {
            return;
        }

        let finalX;

        finalX = -1 * snapItem.info.left + this.#siteOffsetLeft;

        finalX = Math.max( Math.min( 0, finalX ), this.#listDelta );

        // If close to the end, then snap to it
        if ( Math.abs( finalX - this.#listDelta ) <= 3 ) {
            finalX = this.#listDelta;
        }

        // If close to the start, then snap to it
        if ( Math.abs( finalX ) <= 3 ) {
            finalX = 0;
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

        return this.#options._animMoveItem( this.#$list, finalX, (newX) => {
            this.#deltaMove.x = newX;

            this.#options.onSnapUpdate?.( {
                "item":        snapItem,
                "xPos":        this.#deltaMove.x,
                "moveMaxSize": this.#listDelta,
                "isAtStart":   IS_SNAP_TO_START,
                "isAtEnd":     IS_SNAP_TO_END
            } );
        } );
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
        let snapItem;

        const absXPos = Math.abs( xPos );

        for ( const item of this.#itemArray ) {
            if ( item.info.left < absXPos ) {
                continue;
            }

            snapItem  = item;
            break;
        }

        return {
            "snapItem": snapItem ? snapItem : this.#itemArray[ this.#itemArray.length - 1 ],
            "snapToEnd": !snapItem
        };
    }


    #getClosestItem = ( xPos: number ): { snapItem: FLib.DragSlider.Item, snapToEnd: boolean } => {
        let lastDelta, snapItem;

        const absXPos = Math.abs( xPos );

        for ( const item of this.#itemArray ) {
            const IS_LAST_DELTA = typeof lastDelta !== 'undefined';
            const newDelta = Math.abs( absXPos - item.info.left + this.#siteOffsetLeft );

            if ( !IS_LAST_DELTA || newDelta <= lastDelta ) {
                lastDelta = newDelta;
                snapItem  = item;
            }
        }

        return {
            snapItem,
            snapToEnd: false
        };
    }


    #snapToItem = (): void => {
        let snapItem;

        const ABS_DELTA_X = Math.abs( this.#deltaMove.deltaX );

        // If move a bit on right or left, juste move by one item only
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

        this.#snapToItemAnimation( snapItem.snapItem );
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

        this.#options._animKill( this.#$list );

        this.#startDragCoords = coords;
        this.#listDelta       = this.#viewportInfo.width - this.#$list.scrollWidth;
        this.#deltaMove.newX  = this.#deltaMove.x;

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

        this.#options._setCoordinates(this.#$list, this.#deltaMove.newX);

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


    next(): Promise<any> | void {
        const CURRENT_ITEM = this.#currentSnapItem as FLib.DragSlider.Item;

        if ( !this.#isDraggingActive || !this.#itemArray[ CURRENT_ITEM.index + 1 ] ) {
            return;
        }

        return this.#snapToItemAnimation( this.#itemArray[ CURRENT_ITEM.index + 1 ] );
    }


    previous(): Promise<any> | void {
        const CURRENT_ITEM = this.#currentSnapItem as FLib.DragSlider.Item;

        if ( !this.#isDraggingActive || CURRENT_ITEM.isFirst ) {
            return;
        }

        return this.#snapToItemAnimation( this.#itemArray[ CURRENT_ITEM.index - 1 ] );
    }


    goToItem( blockOrIndex: HTMLElement | number ): Promise<any> | void {

        if ( !this.#isDraggingActive ) {
            return;
        }

        let $block;

        if (typeof blockOrIndex === 'number') {
            $block = this.#$items?.[blockOrIndex] as HTMLElement;
        }
        else {
            $block = blockOrIndex;
        }

        if ( !$block ) {
            return;
        }

        const ITEM = this.#itemMap.get( $block );

        if ( !ITEM ) {
            return;
        }

        this.#currentSnapItem = ITEM;

        this.#options.onSnap?.( {
            "item":        ITEM,
            "xPos":        this.#deltaMove.x,
            "moveMaxSize": this.#listDelta,
            "isAtStart":   this.#deltaMove.x === 0,
            "isAtEnd":     this.#deltaMove.x === this.#listDelta
        } );

        return this.#options._animMoveItem(this.#$list, -1 * ITEM.info.left + this.#siteOffsetLeft, (x) => {
            this.#deltaMove.x = x;

            this.#options.onSnapUpdate?.( {
                "item":        ITEM,
                "xPos":        this.#deltaMove.x,
                "moveMaxSize": this.#listDelta,
                "isAtStart":   this.#deltaMove.x === 0,
                "isAtEnd":     this.#deltaMove.x === this.#listDelta
            } );
        });
    }

    refresh = (): this => {
        this.#onResize();

        return this;
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

        aClass( this.#$slider, 'is-active' );

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
            this.#options._animKill( this.#$list );
            this.#options._animClear( this.#$list );
        }

        this.#$viewport && rClass( this.#$viewport, this.#options.dragClass );

        rClass( this.#$slider, 'is-active' );

        return this;
    }

}
