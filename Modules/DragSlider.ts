import { wait } from "../Helpers/Wait";
import { debounce } from "../Helpers/Debounce";
import { offset } from "../DOM/Offset";
import { gesture, gestureOff } from "../Events/Gesture";
import { prop } from "../DOM/Styles";
import { aClass, rClass, tClass } from "../DOM/Class";
import { on, off } from "../Events/EventsManager";
import { isTouchDevice } from "../Tools/TouchDeviceSupport";
import { extend } from "../Helpers/Extend";

const defaultOptions = {
    swipeTresholdMin: 40,
    swipeTresholdSize: 0.5,
    lockedClass: "is-locked",
    _animReset: function ($list) {
        // gsap.set( $list, {
        //     "x": 0,
        //     "y": 0,
        //     "z": 0
        // } );
    },
    _animClear: function ($list) {
        // gsap.set( $list, {
        //     "clearProps": "all"
        // } );
    },
    _animKill: function ($list) {
        // gsap.killTweensOf( $list );
    },
    _animMoveItem: function ($list, x, onUpdate) {
        // return gsap.to( $list, {
        //     "duration": 0.3,
        //     "x":        x,
        //     "y":        0,
        //     "z":        0,
        //     "onUpdate": function() {
        //         onUpdate(gsap.getProperty( this.targets()[ 0 ], 'x' ));
        //     }
        // } );
    },
    _setCoordinates: function ($list, x) {
        // gsap.set( $list, {
        //     "x": x,
        //     "y": 0,
        //     "z": 0
        // } );
    },
};

const MINIMUM_MOVEMENT_TO_START_DRAG = 3; // px

/**
 * DragSlider
 */
export default class DragSlider {
    #isDraggingActive: boolean;
    #options: FLib.DragSlider.Options;
    #deltaMove: FLib.DragSlider.DeltaMove = {
        x: 0,
        deltaX: 0,
        deltaY: 0,
        newX: 0,
    };
    #itemArray: FLib.DragSlider.Item[];
    #$slider: HTMLElement;
    #viewportInfo;
    #siteOffsetLeft = 0;
    #siteOffsetRight = 0;
    #listDelta = 0;
    #$viewport: HTMLElement | undefined;
    #$items: NodeList | undefined;
    #$list: HTMLElement | undefined;
    #isDragging = false;
    #itemMap = new Map<HTMLElement, FLib.DragSlider.Item>();
    #firstItem: FLib.DragSlider.Item | undefined;
    #currentSnapItem: FLib.DragSlider.Item | undefined;
    #hasAlreadyBeenDragged = false;
    #startDragCoords: FLib.Events.Gesture.Coords | undefined;
    #isInitialized = false;
    #visibleItems: FLib.DragSlider.Item[] = [];
    #hiddenItems: FLib.DragSlider.Item[] = [];
    #debouncedOnResize;
    #minXPos: number = 0;
    #maxXPos: number = 0;

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

    get visibleItems(): FLib.DragSlider.Item[] {
        return this.#visibleItems;
    }

    get hiddenItems(): FLib.DragSlider.Item[] {
        return this.#hiddenItems;
    }

    get firstItem(): FLib.DragSlider.Item | undefined {
        return this.#itemArray[0];
    }

    get lastItem(): FLib.DragSlider.Item | undefined {
        return this.#itemArray[this.#itemArray.length - 1];
    }

    constructor(
        $slider: HTMLElement,
        userOptions: Partial<FLib.DragSlider.Options>
    ) {
        if (
            !userOptions.viewportSelector ||
            !userOptions.listSelector ||
            !userOptions.itemSelector ||
            !userOptions.dragClass
        ) {
            throw "[Drag Slider]: Missing at least one of viewportSelector, listSelector, itemSelector, dragClass";
        }

        this.#$slider = $slider;

        this.#isDraggingActive = false;

        this.#options = extend(defaultOptions, userOptions);

        this.#itemArray = [];

        wait("idle").then(this.init);
    }

    #cancelLinkClick = (): void => {
        aClass(this.#$slider, this.#options.dragClass);
    };

    #activeLinkClick = (): void => {
        wait().then(() => {
            rClass(this.#$slider, this.#options.dragClass);
        });
    };

    #onResize = (): void => {
        if (!this.#$items || !this.#$list) {
            return;
        }

        this.#viewportInfo = offset(this.#$viewport as HTMLElement);
        this.#siteOffsetLeft = parseInt(
            prop(this.#$items[0] as HTMLElement, "marginLeft"),
            10
        );
        this.#siteOffsetRight = parseInt(
            prop(
                this.#$items[this.#$items.length - 1] as HTMLElement,
                "marginRight"
            ),
            10
        );

        this.#listDelta = this.#getMaxMoveSize();

        this.#minXPos = 0;
        this.#maxXPos = this.#listDelta;

        const prevIsDraggingActive = this.#isDraggingActive;
        this.#isDraggingActive = this.#listDelta < 0;

        if (!this.#isDraggingActive) {
            this.#isDragging = false;
            this.#options._animKill(this.#$list);
            this.#options._animReset(this.#$list);
        }

        tClass(
            this.#$slider,
            this.#options.lockedClass,
            !this.#isDraggingActive
        );

        if (prevIsDraggingActive !== this.#isDraggingActive) {
            this.#options.onChangeState?.(this.#isDraggingActive);
        }

        this.#itemArray.length = 0;
        const ABS_LIST_DELTA = Math.abs(this.#listDelta);

        let flag = false;

        for (let index = 0; index < this.#$items.length; ++index) {
            const $ITEM = this.#$items[index] as HTMLElement;
            const ITEM_OFFSET = offset($ITEM, false, this.#$list);
            const DATA = {
                index,
                isFirst: index === 0,
                isLast: false,
                $item: $ITEM,
                info: ITEM_OFFSET,
            };

            if (ITEM_OFFSET.left - this.#siteOffsetLeft <= ABS_LIST_DELTA) {
                this.#itemArray.push(DATA);

                this.#itemMap.set($ITEM, DATA);
                continue;
            }

            DATA.isLast = true;

            if (!flag) {
                this.#itemArray.push(DATA);
                // this.#itemArray.push({
                //     ...DATA,
                //     "info":    {
                //         ...ITEM_OFFSET,
                //         "left": ABS_LIST_DELTA + this.#siteOffsetLeft,
                //         "x":    ABS_LIST_DELTA + this.#siteOffsetLeft
                //     }
                // });
            }
            flag = true;

            this.#itemMap.set($ITEM, DATA);
        }

        this.#firstItem = this.#itemMap.get(
            this.#$items[0] as HTMLElement
        ) as FLib.DragSlider.Item;

        if (!this.#currentSnapItem) {
            this.#currentSnapItem = this.#firstItem;
        } else {
            this.#currentSnapItem =
                this.#itemArray[this.#currentSnapItem.index];
        }

        this.#updateAccessibilityFeature();
    };

    #snapToItemAnimation = (snapItem: FLib.DragSlider.Item): Promise<any> => {
        if (!snapItem) {
            return Promise.resolve();
        }

        const finalX = Math.max(
            Math.min(
                this.#minXPos,
                -1 * snapItem.info.left + this.#siteOffsetLeft
            ),
            this.#maxXPos
        );

        this.#options.onSnap?.(this.#getCallbackOptions(finalX, snapItem));

        this.#currentSnapItem = snapItem;

        return this.#options
            ._animMoveItem(this.#$list, finalX, (newX) => {
                this.#deltaMove.x = newX;

                this.#options.onSnapUpdate?.(
                    this.#getCallbackOptions(newX, snapItem)
                );
            })
            .then(() => {
                return this.#updateAccessibilityFeature();
            })
            .then(() => {
                this.#deltaMove.x = finalX;
                this.#options.onSnapEnd?.(
                    this.#getCallbackOptions(this.#deltaMove.x)
                );
            });
    };

    #getCallbackOptions(xPos: number, snapItem?: FLib.DragSlider.Item) {
        const IS_SNAP_TO_END = xPos === this.#listDelta;
        const IS_SNAP_TO_START = xPos === 0;

        return {
            item: snapItem ?? this.#currentSnapItem,
            xPos: this.#deltaMove.x,
            moveMaxSize: this.#listDelta,
            isAtStart: IS_SNAP_TO_START,
            isAtEnd: IS_SNAP_TO_END,
            visibleItems: this.#visibleItems,
            hiddenItems: this.#hiddenItems,
        };
    }

    #getFirstPreviousItem = (
        xPos: number
    ): { snapItem: FLib.DragSlider.Item; snapToEnd: boolean } => {
        let snapItem;

        const absXPos = Math.abs(xPos);

        for (const item of this.#itemArray) {
            if (item.info.left <= absXPos) {
                snapItem = item;
                continue;
            }
            break;
        }

        return {
            snapItem,
            snapToEnd: false,
        };
    };

    #getFirstNextItem = (
        xPos: number
    ): { snapItem: FLib.DragSlider.Item; snapToEnd: boolean } => {
        let snapItem;

        const absXPos = Math.abs(xPos);

        for (const item of this.#itemArray) {
            if (item.info.left < absXPos) {
                continue;
            }

            snapItem = item;
            break;
        }

        return {
            snapItem: snapItem
                ? snapItem
                : this.#itemArray[this.#itemArray.length - 1],
            snapToEnd: !snapItem,
        };
    };

    #getClosestItem = (
        xPos: number
    ): { snapItem: FLib.DragSlider.Item; snapToEnd: boolean } => {
        let lastDelta, snapItem;

        const absXPos = Math.abs(xPos);

        for (const item of this.#itemArray) {
            const IS_LAST_DELTA = typeof lastDelta !== "undefined";
            const newDelta = Math.abs(
                absXPos - item.info.left + this.#siteOffsetLeft
            );

            if (!IS_LAST_DELTA || newDelta <= lastDelta) {
                lastDelta = newDelta;
                snapItem = item;
            }
        }

        return {
            snapItem,
            snapToEnd: false,
        };
    };

    #snapToItem = (): void => {
        let snapItem;

        const ABS_DELTA_X = Math.abs(this.#deltaMove.deltaX);

        // If move a bit on right or left, juste move by one item only
        if (
            ABS_DELTA_X >= this.#options.swipeTresholdMin &&
            ABS_DELTA_X <
                Math.min(
                    (this.#firstItem as FLib.DragSlider.Item).info.width *
                        this.#options.swipeTresholdSize,
                    this.#options.swipeTresholdMin * 3
                )
        ) {
            if (this.#deltaMove.deltaX < 0) {
                snapItem = this.#getFirstNextItem(this.#deltaMove.x);
            } else {
                snapItem = this.#getFirstPreviousItem(this.#deltaMove.x);
            }
        } else {
            snapItem = this.#getClosestItem(this.#deltaMove.x);
        }

        if (!snapItem) {
            return;
        }

        this.#snapToItemAnimation(snapItem.snapItem);
    };

    #getMaxMoveSize(): number {
        return (
            this.#viewportInfo.width -
            this.#$list!.scrollWidth -
            this.#siteOffsetLeft
        );
    }

    #onStartDrag = (
        e: Event,
        $target: HTMLElement,
        coords: FLib.Events.Gesture.Coords
    ): void => {
        if (!this.#hasAlreadyBeenDragged) {
            this.#onResize();
            this.#hasAlreadyBeenDragged = true;
        }

        if (!this.#isDraggingActive || !this.#$list) {
            return;
        }

        this.#isDragging = true;

        this.#options._animKill(this.#$list);

        this.#startDragCoords = coords;
        this.#listDelta = this.#getMaxMoveSize();
        this.#deltaMove.newX = this.#deltaMove.x;

        gesture(document.body, "dragSlider", {
            move: this.#onMove,
            end: this.#onStopDrag,
            preventMove: (e) => {
                if (!e.cancelable) {
                    return false;
                }

                return (
                    !isTouchDevice ||
                    (isTouchDevice &&
                        Math.abs(this.#deltaMove.deltaY) <
                            Math.abs(this.#deltaMove.deltaX))
                );
            },
        });

        this.#options.onStartDrag?.(
            this.#getCallbackOptions(this.#deltaMove.x)
        );
    };

    #onMove = (
        e: Event,
        $target: HTMLElement,
        coords: FLib.Events.Gesture.Coords
    ): void => {
        this.#cancelLinkClick();

        this.#deltaMove.deltaX =
            coords.pageX -
            (this.#startDragCoords as FLib.Events.Gesture.Coords).pageX;
        this.#deltaMove.deltaY =
            coords.pageY -
            (this.#startDragCoords as FLib.Events.Gesture.Coords).pageY;

        if (Math.abs(this.#deltaMove.deltaX) < MINIMUM_MOVEMENT_TO_START_DRAG) {
            return;
        }

        this.#deltaMove.newX = this.#deltaMove.deltaX + this.#deltaMove.x;
        this.#deltaMove.newX = Math.max(
            Math.min(this.#minXPos, this.#deltaMove.newX),
            this.#maxXPos
        );

        this.#options._setCoordinates(this.#$list, this.#deltaMove.newX);

        this.#options.onDrag?.(this.#getCallbackOptions(this.#deltaMove.newX));
    };

    #onStopDrag = (): void => {
        gestureOff(document.body, "dragSlider");
        this.#isDragging = false;

        this.#activeLinkClick();

        if (this.#deltaMove.x === this.#deltaMove.newX) {
            return;
        }

        this.#deltaMove.x = this.#deltaMove.newX;

        this.#snapToItem();

        this.#options.onStopDrag?.(this.#getCallbackOptions(this.#deltaMove.x));
    };

    #onMouseenter = (): void => {
        if (this.#isDragging || !this.#isDraggingActive) {
            return;
        }

        this.#options.onMouseEnter?.(
            this.#getCallbackOptions(this.#deltaMove.x)
        );
    };

    #onMouseleave = (): void => {
        if (this.#isDragging || !this.#isDraggingActive) {
            return;
        }

        this.#options.onMouseLeave?.(
            this.#getCallbackOptions(this.#deltaMove.x)
        );
    };

    #cancelDrag = (e: Event): void => {
        e.preventDefault();
    };

    next(): Promise<any> {
        const CURRENT_ITEM = this.#currentSnapItem as FLib.DragSlider.Item;

        if (
            !this.#isDraggingActive ||
            !this.#itemArray[CURRENT_ITEM.index + 1]
        ) {
            return Promise.resolve();
        }

        return this.#snapToItemAnimation(
            this.#itemArray[CURRENT_ITEM.index + 1]
        );
    }

    previous(): Promise<any> {
        const CURRENT_ITEM = this.#currentSnapItem as FLib.DragSlider.Item;

        if (!this.#isDraggingActive || CURRENT_ITEM.isFirst) {
            return Promise.resolve();
        }

        return this.#snapToItemAnimation(
            this.#itemArray[CURRENT_ITEM.index - 1]
        );
    }

    goToItem(blockOrIndex: HTMLElement | number): Promise<any> {
        if (!this.#isDraggingActive) {
            return Promise.resolve();
        }

        let $block;

        if (typeof blockOrIndex === "number") {
            $block = this.#$items?.[blockOrIndex] as HTMLElement;
        } else {
            $block = blockOrIndex;
        }

        if (!$block) {
            return Promise.resolve();
        }

        const ITEM = this.#itemMap.get($block);

        if (!ITEM) {
            return Promise.resolve();
        }

        this.#currentSnapItem = ITEM;

        const xPos = -1 * ITEM.info.left + this.#siteOffsetLeft;

        this.#options.onSnap?.(this.#getCallbackOptions(xPos, ITEM));

        return this.#options
            ._animMoveItem(this.#$list, xPos, (x) => {
                this.#deltaMove.x = x;

                this.#options.onSnapUpdate?.(
                    this.#getCallbackOptions(this.#deltaMove.x, ITEM)
                );
            })
            .then(() => this.#updateAccessibilityFeature());
    }

    #updateAccessibilityFeature = (): void => {
        this.#visibleItems.length = 0;
        this.#hiddenItems.length = 0;

        this.#itemMap.forEach((item) => {
            const hideElement1 = item.info.left + this.#deltaMove.x < 0;
            const hideElement2 =
                item.info.left + item.info.width + this.#deltaMove.x >
                this.#viewportInfo.width;

            if (hideElement1 || hideElement2) {
                item.$item.setAttribute("tabindex", "-1");
                item.$item.setAttribute("inert", "");
                item.$item.setAttribute("aria-hidden", "true");
                this.#hiddenItems.push(item);
                return;
            }

            item.$item.removeAttribute("tabindex");
            item.$item.removeAttribute("inert");
            item.$item.setAttribute("aria-hidden", "false");
            this.#visibleItems.push(item);
        });
    };

    refresh = (): this => {
        this.#onResize();

        return this;
    };

    init = (): this => {
        if (this.#isInitialized) {
            return this;
        }

        this.#isInitialized = true;

        if (!this.#$viewport) {
            const $VP = this.#$slider.querySelector(
                this.#options.viewportSelector
            );
            if (!$VP) {
                throw `"${this.#options.viewportSelector}" not found`;
            }
            this.#$viewport = $VP as HTMLElement;

            const $LST = this.#$viewport.querySelector(
                this.#options.listSelector
            );
            if (!$LST) {
                throw `"${this.#options.listSelector}" not found`;
            }
            this.#$list = $LST as HTMLElement;

            const $ITEMS = this.#$list.querySelectorAll(
                this.#options.itemSelector
            );
            if (!$ITEMS) {
                throw `"${this.#options.itemSelector}" not found`;
            }
            this.#$items = $ITEMS as NodeList;

            this.#debouncedOnResize = debounce(this.#onResize);
        }

        if (!this.#$items?.length) {
            return this;
        }

        aClass(this.#$slider, "is-active");

        this.#onResize();

        on(window, {
            eventsName: "resize",
            callback: this.#debouncedOnResize,
        });

        gesture(this.#$viewport, "dragSlider", {
            start: this.#onStartDrag,
        });

        // Avoid image or content drag on Firefox
        on(this.#$items, {
            eventsName: "dragstart",
            callback: this.#cancelDrag,
        });

        on(this.#$viewport, {
            eventsName: "mouseenter",
            callback: this.#onMouseenter,
        });

        on(this.#$viewport, {
            eventsName: "mouseleave",
            callback: this.#onMouseleave,
        });

        this.#options.onInit?.(this.#getCallbackOptions(this.#deltaMove.x));

        return this;
    };

    destroy(): this {
        this.#isInitialized = false;
        this.#hasAlreadyBeenDragged = false;

        if (!this.#$items?.length) {
            return this;
        }

        off(window, {
            eventsName: "resize",
            callback: this.#debouncedOnResize,
        });

        this.#$viewport && gestureOff(this.#$viewport, "dragSlider");

        gestureOff(document.body, "dragSlider");

        off(this.#$items, {
            eventsName: "dragstart",
            callback: this.#cancelDrag,
        });

        off(this.#$viewport, {
            eventsName: "mouseenter",
            callback: this.#onMouseenter,
        });

        off(this.#$viewport, {
            eventsName: "mouseleave",
            callback: this.#onMouseleave,
        });

        if (this.#$list) {
            this.#options._animKill(this.#$list);
            this.#options._animClear(this.#$list);
        }

        this.#$viewport && rClass(this.#$viewport, this.#options.dragClass);

        rClass(this.#$slider, "is-active");

        return this;
    }
}
