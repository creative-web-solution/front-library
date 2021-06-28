import { on, off } from '@creative-web-solution/front-library/Events/EventsManager';
import { extend }  from '@creative-web-solution/front-library/Helpers/Extend';


export enum GestureDirection {
    up        = "up",
    down      = "down",
    left      = "left",
    right     = "right",
    upRight   = "up-right",
    downRight = "down-right",
    upLeft    = "up-left",
    downLeft  = "down-left",
    none      = "none"
}

export enum GestureMode {
    "touch",
    "mouse",
    "pointer",
    "click"
}


const defaultOptions: GestureOptionsType = {
    "threshold":            20,
    "useTouch":             true,
    "velocityMax":          -1,
    "angleThreshold":       2,
    "preventClick":         false,
    "stopPropagationClick": false,
    "preventStart":         false,
    "stopPropagationStart": false,
    "preventMove":          false,
    "stopPropagationMove":  false,
    "preventEnd":           false,
    "stopPropagationEnd":   false
};


const gestureList                    = new Map();

// max time allowed between last touchmove and touchend
const MAX_STATIC_TIME                = 50;

const SWIPE_DIRECTION_LEFT_OR_UP     = -1;
const SWIPE_DIRECTION_RIGHT_OR_DOWN  = 1;
const MIN_DELTA_FOR_DIRECTION_CHANGE = 5; // px

// const TOUCH_MODE                     = 'touch';
// const MOUSE_MODE                     = 'mouse';
// const POINTER_MODE                   = 'pointer';
// const CLICK_ONLY_MODE                = 'click';


const EVENTS_NAME = ( function() {
    let start, move, end, mode: GestureMode;

    const click = 'click';
    mode        = GestureMode.click;

    if ( 'ontouchstart' in document ) {
        start = 'touchstart';
        move  = 'touchmove';
        end   = 'touchend';
        mode  = GestureMode.touch;
    }
    else if ( window.PointerEvent ) {
        start = 'pointerdown';
        move  = 'pointermove';
        end   = 'pointerup';
        mode  = GestureMode.pointer;
    }
    else if ( window.MSPointerEvent ) {
        start = 'MSPointerDown';
        move  = 'MSPointerMove';
        end   = 'MSPointerUp';
        mode  = GestureMode.pointer;
    }
    else if ( 'onmousedown' in document ) {
        start = 'mousedown';
        move  = 'mousemove';
        end   = 'mouseup';
        mode  = GestureMode.mouse;
    }

    return {
        start,
        move,
        end,
        click,
        mode,
        "hasTouch": mode !== GestureMode.click
    };
} )();


function getPos( e ) {
    let obj;

    if ( EVENTS_NAME.mode === GestureMode.pointer || EVENTS_NAME.mode === GestureMode.mouse ) {
        if ( e.pageX ) {
            obj = {
                "pageX":   e.pageX,
                "pageY":   e.pageY,
                "clientX": e.clientX,
                "clientY": e.clientY
            };
        }
        else {
            obj = e.originalEvent;

            // Event may have an overlay due to library like 'bean' or 'jQuery'
            while ( obj && obj.pageX === undefined ) {
                obj = obj.originalEvent;
            }
        }
    }
    else if (
        e.changedTouches &&
        e.changedTouches[ 0 ] &&
        e.changedTouches[ 0 ].pageX !== undefined
    ) {
        obj = e.changedTouches[ 0 ];
    }

    return {
        "pageX":   obj ? obj.pageX : -1,
        "pageY":   obj ? obj.pageY : -1,
        "clientX": obj ? obj.clientX : -1,
        "clientY": obj ? obj.clientY : -1,
        "mode":    EVENTS_NAME.mode
    };
}


function bindEvent( $elem: Node, eventsName: string, callback, options: GestureOptionsType, selector?: string ) {
    let eventOptions;

    // Fix passive event on chrome 54+
    const fixPassiveEvent =
        ( eventsName === EVENTS_NAME.start && ( options.preventStart || options.stopPropagationStart ) ) ||
        ( eventsName === EVENTS_NAME.move && ( options.preventMove || options.stopPropagationMove ) );

    if ( fixPassiveEvent ) {
        eventOptions = {
            "passive": false
        };
    }

    on( $elem, {
        eventsName,
        selector,
        callback,
        eventOptions
    } );
}


function unbindEvent( $elem: Node, eventsName: string, callback ) {
    off( $elem, {
        eventsName,
        callback
    } );
}


function eventsHelper( e, eventName: string, options: GestureOptionsType, $currentTargetElement: Node ) {
    const preventDefault = options[ `prevent${eventName}` ];
    const stopPropagation = options[ `stopPropagation${eventName}` ];

    if (
        ( typeof preventDefault === 'function' &&
            preventDefault.call( $currentTargetElement, e, $currentTargetElement ) ) ||
        ( typeof preventDefault !== 'function' && preventDefault )
    ) {
        e.preventDefault();
    }

    if (
        ( typeof stopPropagation === 'function' &&
            stopPropagation.call( $currentTargetElement, e, $currentTargetElement ) ) ||
        ( typeof stopPropagation !== 'function' && stopPropagation )
    ) {
        e.stopPropagation();
    }
}


/* -------------------- MANAGER */


class GestureManager {
    #isAllCancelled;
    #isTapCancelled;
    #isTapEventFired;
    #isSwipeLeftFired;
    #isSwipeRightFired;
    #isSwipeUpFired;
    #isSwipeDownFired;
    #velocityVars;
    #startX;
    #startY;
    #currentX;
    #currentY;
    #lastX;
    #lastY;
    #deltaX;
    #deltaY;
    #lastTouchMoveTime;
    #lastDirections;
    #$currentTargetElement;
    #$element;
    #velocityArray: VelocityType[] = [];
    #options: GestureOptionsType;

    get $element() {
        return this.#$element;
    }


    constructor( $element: Node, options: GestureOptionsType ) {
        this.#$element = $element;
        this.#options  = options;


        if ( EVENTS_NAME.hasTouch && options.useTouch ) {
            bindEvent(
                $element,
                EVENTS_NAME.start,
                this.#onStart,
                options,
                options.selector
            );
        }


        bindEvent(
            $element,
            EVENTS_NAME.click,
            this.#onClick,
            options,
            options.selector
        );
    }

    private cancelAll() {
        this.#isAllCancelled = true;
        this.#isTapCancelled = true;
        unbindEvent( document.body, EVENTS_NAME.move, this.#onMove );
        unbindEvent( document.body, EVENTS_NAME.end, this.#onEnd );
    }


    private init() {
        this.#isAllCancelled    = false;
        this.#isTapCancelled    = false;
        this.#isTapEventFired   = false;
        this.#isSwipeLeftFired  = false;
        this.#isSwipeRightFired = false;
        this.#isSwipeUpFired    = false;
        this.#isSwipeDownFired  = false;
        this.#lastTouchMoveTime = -1;
        this.#lastDirections = {
            "vert": 0,
            "horiz": 0
        };

        if ( this.#options.swipe ) {
            this.#velocityVars = {
                "startTime": 0,
                "endTime":   0,
                "startPosX": 0,
                "endPosX":   0,
                "startPosY": 0,
                "endPosY":   0
            };

            this.#velocityArray.length = 0;
        }
    }


    // Swipe are called only one time
    private handleSwipe = ( e ): void => {
        if ( Math.abs( this.#deltaX ) >= (this.#options.threshold as number) ) {
            this.#isTapCancelled = true;

            if ( this.#deltaX > 0 ) {
                if ( !this.#isSwipeLeftFired && this.#options.swipeLeft ) {
                    this.#isSwipeLeftFired = true;
                    this.#options.swipeLeft.call( e.target, e, this.#$currentTargetElement, 'swipeLeft' );
                }
            }
            else {
                if ( !this.#isSwipeRightFired && this.#options.swipeRight ) {
                    this.#isSwipeRightFired = true;
                    this.#options.swipeRight.call( e.target, e, this.#$currentTargetElement, 'swipeRight' );
                }
            }
        }
        else if ( Math.abs( this.#deltaY ) >= (this.#options.threshold as number) ) {
            this.#isTapCancelled = true;

            if ( this.#deltaY > 0 ) {
                if ( !this.#isSwipeUpFired && this.#options.swipeUp ) {
                    this.#isSwipeUpFired = true;
                    this.#options.swipeUp.call( e.target, e, this.#$currentTargetElement, 'swipeUp' );
                }
            }
            else {
                if ( !this.#isSwipeDownFired && this.#options.swipeDown)  {
                    this.#isSwipeDownFired = true;
                    this.#options.swipeDown.call( e.target, e, this.#$currentTargetElement, 'swipeDown' );
                }
            }
        }
    }


    // Called along with touchmove
    private handleMove = ( e ): void => {
        const moveOnX =
            Math.abs( this.#currentX - this.#lastX ) > Math.abs( this.#currentY - this.#lastY );

        if ( moveOnX && this.#currentX < this.#lastX ) {
            if ( this.#options.moveLeft ) {
                this.#options.moveLeft.call( e.target, e, this.#$currentTargetElement, 'moveLeft' );
            }
        }
        else if ( moveOnX && this.#currentX > this.#lastX ) {
            if ( this.#options.moveRight ) {
                this.#options.moveRight.call( e.target, e, this.#$currentTargetElement, 'moveRight' );
            }
        }

        if ( !moveOnX && this.#currentY < this.#lastY ) {
            if ( this.#options.moveUp ) {
                this.#options.moveUp.call( e.target, e, this.#$currentTargetElement, 'moveUp' );
            }
        }
        else if (!moveOnX && this.#currentY > this.#lastY) {
            if ( this.#options.moveDown ) {
                this.#options.moveDown.call( e.target, e, this.#$currentTargetElement, 'moveDown' );
            }
        }
    }


    private handleVelocity( mustReset: boolean ) {
        this.#velocityVars.startPosX = this.#velocityVars.endPosX;
        this.#velocityVars.startPosY = this.#velocityVars.endPosY;
        this.#velocityVars.endPosX   = this.#currentX;
        this.#velocityVars.endPosY   = this.#currentX;

        this.#velocityVars.startTime = this.#velocityVars.endTime || Date.now();
        this.#velocityVars.endTime   = Date.now();

        const velocityDistance = Math.sqrt(
            Math.pow( this.#velocityVars.endPosX - this.#velocityVars.startPosX, 2 ) +
                Math.pow( this.#velocityVars.endPosY - this.#velocityVars.startPosY, 2 )
        );

        const deltaTime = this.#velocityVars.endTime - this.#velocityVars.startTime;

        if ( mustReset ) {
            this.#velocityArray.length = 0;
        }

        if ( velocityDistance === 0 || deltaTime === 0 ) {
            return;
        }

        this.#velocityArray.push({
            "velocity": ( velocityDistance * 1000 ) / deltaTime,
            velocityDistance,
            deltaTime
        } );
    }


    private fuzzyEquals( angle: number, targetAngle: number ) {
        return (
            angle >= targetAngle - (this.#options.angleThreshold as number) &&
            angle <= targetAngle + (this.#options.angleThreshold as number)
        );
    }


    private getVelocityData(): GestureVelocityType {
        let angle,
            direction: GestureDirection = GestureDirection.none;

        const currentTime = new Date().valueOf();

        if (
            this.#velocityArray.length === 0 ||
            // The pointer stay on the same place for more than MAX_STATIC_TIME
            ( this.#lastTouchMoveTime > 0 &&
                currentTime - this.#lastTouchMoveTime > MAX_STATIC_TIME )
        ) {
            return {
                "velocity": -1, // px / seconds
                "averageVelocity": -1, // px / seconds
                "angle": -1, // deg
                direction
            };
        }

        const averageVelocity =
                    this.#velocityArray.reduce( ( sum, value ) => sum + value.velocity, 0 ) /
                    this.#velocityArray.length;
        const instantVelocity = this.#velocityArray[ this.#velocityArray.length - 1 ];

        const deltaPosX = this.#currentX - this.#startX;
        const deltaPosY = this.#currentY - this.#startY;
        const angleDistance = Math.sqrt(
            Math.pow( deltaPosX, 2 ) + Math.pow( deltaPosY, 2 )
        );

        angle = Math.acos( Math.abs( deltaPosX ) / angleDistance );
        angle = ( angle * 180 ) / Math.PI;

        if ( deltaPosX > 0 && deltaPosY > 0 ) {
            direction = GestureDirection.downRight;
            angle = 360 - angle;

            if ( this.fuzzyEquals( angle, 360 ) ) {
                direction = GestureDirection.right;
                angle = 0;
            }
            else if ( this.fuzzyEquals( angle, 270 ) ) {
                direction = GestureDirection.down;
                angle = 270;
            }
        }
        else if ( deltaPosX > 0 && deltaPosY < 0 ) {
            direction = GestureDirection.upRight;

            if ( this.fuzzyEquals( angle, 360 ) ) {
                direction = GestureDirection.right;
                angle = 0;
            }
            else if ( this.fuzzyEquals( angle, 90 ) ) {
                direction = GestureDirection.up;
                angle = 90;
            }
        }
        else if ( deltaPosX < 0 && deltaPosY > 0 ) {
            direction = GestureDirection.downLeft;
            angle = angle + 180;

            if ( this.fuzzyEquals( angle, 180 ) ) {
                direction = GestureDirection.left;
                angle = 180;
            }
            else if ( this.fuzzyEquals( angle, 270 ) ) {
                direction = GestureDirection.down;
                angle = 270;
            }
        }
        else if ( deltaPosX < 0 && deltaPosY < 0 ) {
            direction = GestureDirection.upLeft;
            angle = 180 - angle;

            if ( this.fuzzyEquals( angle, 180 ) ) {
                direction = GestureDirection.left;
                angle = 180;
            }
            else if ( this.fuzzyEquals( angle, 90 ) ) {
                direction = GestureDirection.up;
                angle = 90;
            }
        }

        return {
            "velocity":
            (this.#options.velocityMax as number) < 0
                    ? instantVelocity.velocity
                    : Math.min(
                            (this.#options.velocityMax as number),
                            instantVelocity.velocity
                        ),
            "averageVelocity":
                (this.#options.velocityMax as number) < 0
                    ? averageVelocity
                    : Math.min( (this.#options.velocityMax as number), averageVelocity ), // px / seconds
            "angle": angle, // deg
            "direction": direction
        };
    }


    #onStart = ( e ): void => {
        eventsHelper( e, 'Start', this.#options, e.target );

        // Multitouch not handle for now
        if ( e.touches && e.touches.length > 1 ) {
            this.#$currentTargetElement = null;
            this.cancelAll();
            return;
        }

        const touchCoords = getPos( e );

        this.#$currentTargetElement = e.target;

        if ( this.#options.start ) {
            this.#options.start.call( this.#$currentTargetElement, e, this.#$currentTargetElement, touchCoords, 'start' );
        }

        this.init();

        if ( touchCoords.pageX > -1 ) {
            this.#currentX = this.#startX = this.#lastX = touchCoords.pageX;
            this.#currentY = this.#startY = this.#lastY = touchCoords.pageY;

            bindEvent(
                document.body,
                EVENTS_NAME.move,
                this.#onMove,
                this.#options
            );
        }

        if ( EVENTS_NAME.hasTouch && this.#options.useTouch ) {
            bindEvent(
                document.body,
                EVENTS_NAME.end,
                this.#onEnd,
                this.#options
            );
        }
    }


    #onMove = ( e ): void => {
        eventsHelper( e, 'Move', this.#options, this.#$currentTargetElement );

        if ( this.#isAllCancelled ) {
            return;
        }

        if ( e.touches && e.touches.length > 1 ) {
            return this.cancelAll();
        }

        const touchCoords = getPos(e);

        if ( this.#options.move ) {
            this.#options.move.call( this.#$currentTargetElement, e, this.#$currentTargetElement, touchCoords, 'move' );
        }

        const currentDirections: { [ key: string ] : number } = {};

        // Move only on Y
        if (
            Math.abs( this.#lastX - touchCoords.pageX ) <=
            MIN_DELTA_FOR_DIRECTION_CHANGE
        ) {
            currentDirections.horiz = this.#lastDirections.horiz;
        }
        else {
            currentDirections.horiz =
                this.#lastX - touchCoords.pageX > 0
                    ? SWIPE_DIRECTION_LEFT_OR_UP
                    : SWIPE_DIRECTION_RIGHT_OR_DOWN;
        }

        // Move only on X
        if (
            Math.abs( this.#lastY - touchCoords.pageY ) <=
            MIN_DELTA_FOR_DIRECTION_CHANGE
        ) {
            currentDirections.vert = this.#lastDirections.vert;
        }
        else {
            currentDirections.vert =
                this.#lastY - touchCoords.pageY > 0
                    ? SWIPE_DIRECTION_LEFT_OR_UP
                    : SWIPE_DIRECTION_RIGHT_OR_DOWN;
        }

        const hasDirectionChanged =
            this.#lastDirections.vert !== currentDirections.vert ||
            this.#lastDirections.horiz !== currentDirections.horiz;

        if ( hasDirectionChanged ) {
            this.#startX = this.#lastX;
            this.#startY = this.#lastY;
        }

        this.#lastX = this.#currentX;
        this.#lastY = this.#currentY;
        this.#currentX = touchCoords.pageX;
        this.#currentY = touchCoords.pageY;
        this.#deltaX = this.#startX - this.#currentX;
        this.#deltaY = this.#startY - this.#currentY;
        this.#lastTouchMoveTime = new Date().valueOf();

        if ( this.#options.swipe ) {
            this.handleVelocity( hasDirectionChanged );
        }

        this.#lastDirections = currentDirections;

        this.handleSwipe( e );
        this.handleMove( e );
    }


    #onEnd = ( e ): void => {
        eventsHelper( e, 'End', this.#options, this.#$currentTargetElement );
        unbindEvent( document.body, EVENTS_NAME.move, this.#onMove );
        unbindEvent( document.body, EVENTS_NAME.end, this.#onEnd );

        if ( this.#options.end ) {
            this.#options.end.call( this.#$currentTargetElement, e, this.#$currentTargetElement, getPos( e ), 'end' );
        }

        if ( !this.#isTapCancelled && !this.#isTapEventFired && this.#options.tap ) {
            this.#options.tap.call( this.#$currentTargetElement, e, this.#$currentTargetElement, getPos( e ), 'tap' );
            this.#isTapEventFired = true;
        }

        if ( this.#options.swipe ) {
            const velocityData = this.getVelocityData();

            if ( velocityData.averageVelocity >= 0 ) {
                this.#options.swipe.call( this.#$currentTargetElement, e, this.#$currentTargetElement, velocityData, 'swipe' );
            }
        }
    }


    #onClick = ( e ): void => {
        eventsHelper( e, 'Click', this.#options, this.#$currentTargetElement );

        if ( this.#options.click ) {
            this.#options.click.call( this.#$currentTargetElement, e, this.#$currentTargetElement, getPos( e ), 'click' );
        }

        if ( !this.#isTapCancelled && !this.#isTapEventFired && this.#options.tap ) {
            this.#options.tap.call( this.#$currentTargetElement, e, this.#$currentTargetElement, getPos(e), 'tap' );
            if ( EVENTS_NAME.mode !== GestureMode.click ) {
                this.#isTapEventFired = true;
            }
        }
    }


    destroy() {
        if ( EVENTS_NAME.hasTouch && this.#options.useTouch ) {
            unbindEvent( this.#$element, EVENTS_NAME.start, this.#onStart );
            unbindEvent( document.body, EVENTS_NAME.move, this.#onMove );
            unbindEvent( document.body, EVENTS_NAME.end, this.#onEnd );
        }

        unbindEvent( this.#$element, EVENTS_NAME.click, this.#onClick );
    };
}


/* -------------------- API */

function addManager( $element: Node, handlerName: string | Symbol, options: GestureOptionsType ): GestureManagerType {
    let handler = gestureList.get( handlerName );

    if ( !handler ) {
        handler = [];
        gestureList.set( handlerName, handler );
    }


    handler.push( new GestureManager( $element, options ) );

    return {
        "off": function() {
            removeManager( $element, handlerName );
        }
    };
}


function removeManager( $element: Node, handlerName: string | Symbol ): void {
    let idx = 0;
    const handler = gestureList.get( handlerName );


    if ( !handler || !handler.length ) {
        return;
    }

    while ( idx < handler.length ) {
        const manager = handler[ idx ];

        if ( manager.$element === $element ) {
            manager.destroy();
            handler.splice( idx, 1 );
        }
        else {
            idx++;
        }
    }
}


/**
 * Handle touch and mouse event
 *
 * @param $elements - DOM element or DOMList element
 * @param handlerName - Name of the handler used to retrieve it and unbind events with gestureOff
 * @param userOptions
 *
 * @see
 * For more details, see extra/events.md
 *
 * @example
 * let gestureHanlder = gesture( $element, 'handlerName', options );
 *
 * // To cancel
 * gestureOff( $element, 'handlerName' );
 *
 * // or
 * gestureHanlder.off();
 *
 * @returns The handler (or array of handlers) to unbind events
 */
export function gesture( $elements: GestureElementsType, handlerName: string | Symbol, userOptions: GestureOptionsType ): GestureManagerType | GestureManagerType[] {
    const options = extend( defaultOptions, userOptions );

    if (
        typeof ($elements as NodeList).length === 'number' &&
        ($elements as HTMLElement).tagName !== 'FORM'
    ) {
        const managers: GestureManagerType[] = [];

        ($elements as NodeList).forEach($element => {
            managers.push( addManager( $element, handlerName, options ) );
        });

        return managers;
    }

    return addManager( ($elements as HTMLElement), handlerName, options );

}


/**
 * Remove touch and mouse event
 *
 * @param $elements - DOM element or DOMList element
 * @param handlerName - Name of the handler to unbind events
 *
 * @example
 * gestureOff( $element, 'handlerName' );
 */
export function gestureOff( $elements: GestureElementsType, handlerName: string | Symbol ): void {
    if (
        typeof ($elements as NodeList).length === 'number' &&
        ($elements as HTMLElement).tagName !== 'FORM'
    ) {
        ($elements as NodeList).forEach( $element => {
            removeManager( $element, handlerName );
        });
    }
    else {
        removeManager( ($elements as HTMLElement), handlerName );
    }
}
