type DragSliderCallbackParam = {
    item:        any;
    xPos:        number;
    moveMaxSize: number;
    isAtStart:   boolean;
    isAtEnd:     boolean;
}

type DragSliderItemType = {
    index:   number;
    isFirst: boolean;
    isLast:  boolean;
    $item:   HTMLElement;
    info:    OffsetType;
}

type DeltaMoveType = {
    x:      number;
    deltaX: number;
    deltaY: number;
    newX:   number;
}

type DragSliderCallback = ( data: DragSliderCallbackParam ) => void;

type DragSliderOptions = {
    viewportSelector:   string;
    listSelector:       string;
    itemSelector:       string;
    dragClass:          string;
    /** @default is-locked */
    lockedClass?:       string;
    onStartDrag?:       DragSliderCallback;
    onDrag?:            DragSliderCallback;
    onStopDrag?:        DragSliderCallback;
    onSnap?:            DragSliderCallback;
    onSnapUpdate?:      DragSliderCallback;
    onMouseEnter?:      DragSliderCallback;
    onMouseLeave?:      DragSliderCallback;
    onInit?:            DragSliderCallback;
    onChangeState?:     ( isDragging: boolean ) => void;
    /**
     * In px.
     * @default 40
    */
    swipeTresholdMin?: number;
    /**
     * In % (0.5 = 50% of the size of one item).
     * @default 0.5
    */
    swipeTresholdSize?:number;
}
