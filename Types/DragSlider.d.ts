namespace FLib {
    namespace DragSlider {
        type CallbackParam = {
            item:        any;
            xPos:        number;
            moveMaxSize: number;
            isAtStart:   boolean;
            isAtEnd:     boolean;
        }

        type Item = {
            index:   number;
            isFirst: boolean;
            isLast:  boolean;
            $item:   HTMLElement;
            info:    OffsetType;
        }

        type DeltaMove = {
            x:      number;
            deltaX: number;
            deltaY: number;
            newX:   number;
        }

        type Callback = ( data: CallbackParam ) => void;

        type Options = {
            viewportSelector:   string;
            listSelector:       string;
            itemSelector:       string;
            dragClass:          string;
            /** @defaultValue is-locked */
            lockedClass:        string;
            onStartDrag?:       Callback;
            onDrag?:            Callback;
            onStopDrag?:        Callback;
            onSnap?:            Callback;
            onSnapUpdate?:      Callback;
            onMouseEnter?:      Callback;
            onMouseLeave?:      Callback;
            onInit?:            Callback;
            onChangeState?:     ( isDragging: boolean ) => void;
            /**
             * In px.
             * @defaultValue 40
            */
            swipeTresholdMin: number;
            /**
             * In % (0.5 = 50% of the size of one item).
             * @defaultValue 0.5
            */
            swipeTresholdSize:number;
        }
    }
}
