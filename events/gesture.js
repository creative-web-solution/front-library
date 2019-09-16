import { on, off } from 'front-library/Events/EventsManager';
import { extend } from 'front-library/Helpers/Extend';

/**
 * @callback gestureEvents_Callback
 * @description Called when original events (touchstart, mousedown, pointerdown, ...) are fired
 * @param {event} e - Original events. For move and end events, e.currentTarget point to document.body. Use the $target param instead.
 * @param {HTMLElement} $target - Targeted element (direct or by delegation)
 * @param {Object} coords - Coordinates of the pointer
 * @param {number} coords.pageX
 * @param {number} coords.pageY
 * @param {number} coords.clientX
 * @param {number} coords.clientY
 * @param {string} coords.mode - touch | mouse | pointer | click
 * @param {string} type - Name of the event
 */
/**
 * @callback gestureCustomEvents_Callback
 * @description Called when custom event (swipeLeft, swipeUp, moveUp, ... but not swipe) are fired
 * @param {event} e - Original events
 * @param {HTMLElement} $target - Targeted element (direct or by delegation)
 * @param {string} type - Name of the event
 */
/**
 * @callback gestureSwipeEvent_Callback
 * @description Called when the swipe event is fire
 * @param {event} e - Original events
 * @param {HTMLElement} $target - Targeted element (direct or by delegation)
 * @param {string} type - Name of the event
 * @param {Object} velocityData
 * @param {number} velocityData.velocity - Last computed velocity of the movement in px / seconds
 * @param {string} velocityData.averageVelocity - Average velocity of the whole movment in px / seconds
 * @param {string} velocityData.angle - In deg
 * @param {string} velocityData.direction - up | down | left | right | up-right | down-right | up-left |down-left | none
 */
/**
 * Handle touch and mouse event
 *
 * @function gesture
 * @param {(HTMLElement|HTMLElement[])} $elements - DOM element or DOMList element
 * @param {string} handlerName - Name of the handler used to retrieve it and unbind events with gestureOff
 * @param {Object} userOptions
 * @param {string} [userOptions.selector] - Used for event delegation
 * @param {gestureEvents_Callback} [userOptions.start] - touchstart, pointerdown, mousedown
 * @param {gestureEvents_Callback} [userOptions.move] - touchmove, pointermove, mousemove
 * @param {gestureEvents_Callback} [userOptions.end] - touchend, pointerup, mouseup
 * @param {gestureEvents_Callback} [userOptions.click] - click
 * @param {gestureEvents_Callback} [userOptions.tap] - touchend on touch device, click on other
 * @param {gestureCustomEvents_Callback} [userOptions.swipeLeft]
 * @param {gestureCustomEvents_Callback} [userOptions.swipeRight]
 * @param {gestureCustomEvents_Callback} [userOptions.swipeUp]
 * @param {gestureCustomEvents_Callback} [userOptions.swipeDown]
 * @param {gestureSwipeEvent_Callback} [userOptions.swipe]
 * @param {gestureCustomEvents_Callback} [userOptions.moveLeft]
 * @param {gestureCustomEvents_Callback} [userOptions.moveRight]
 * @param {gestureCustomEvents_Callback} [userOptions.moveUp]
 * @param {gestureCustomEvents_Callback} [userOptions.moveDown]
 * @param {number} [userOptions.threshold=20] - In px, minimal distance to do to trigger events
 * @param {boolean} [userOptions.useTouch=true] - Use all touch, pointer or mouse events, or only click event
 * @param {number} [userOptions.velocityMax=-1] - Cap valocity
 * @param {number} [userOptions.angleThreshold=2] - In deg, sensitivity of angle detection
 * @param {(boolean|Function)} [userOptions.preventClick=false] - Prevent click
 * @param {(boolean|Function)} [userOptions.stopPropagationClick=false] - Stop propagation of click
 * @param {(boolean|Function)} [userOptions.preventStart=false] - Prevent touchstart, pointerdown, ...
 * @param {(boolean|Function)} [userOptions.stopPropagationStart=false] - Stop propagation of touchstart, pointerdown, ...
 * @param {(boolean|Function)} [userOptions.preventMove=false] - Prevent touchmove, pointermove, ...
 * @param {(boolean|Function)} [userOptions.stopPropagationMove=false] - Stop propagation of touchmove, pointermove, ...
 * @param {(boolean|Function)} [userOptions.preventEnd=false] - Prevent touchend, pointerup, ...
 * @param {(boolean|Function)} [userOptions.stopPropagationEnd=false] - Stop propagation of touchend, pointerup, ...
 *
 * @see For more details, see extra/events.md
 *
 * @example let gestureHanlder = gesture( $element, 'handlerName', options );
 *
 * // To cancel
 * gestureOff( $element, 'handlerName' );
 *
 * // or
 * gestureHanlder.off();
 *
 * @returns {(object|Array)} - The handler (or array of handlers) to unbind events
 */
let gesture;

/**
 * Remove touch and mouse event
 *
 * @function gestureOff
 * @param {(HTMLElement|HTMLElement[])} $elements - DOM element or DOMList element
 * @param {string} handlerName - Name of the handler to unbind events
 *
 * @example gestureOff( $element, 'handlerName' );
 */
let gestureOff;

{
    /** @lends gesture */

    const defaultOptions = {
        threshold: 20,
        useTouch: true,
        velocityMax: -1,
        angleThreshold: 2,
        preventClick: false,
        stopPropagationClick: false,
        preventStart: false,
        stopPropagationStart: false,
        preventMove: false,
        stopPropagationMove: false,
        preventEnd: false,
        stopPropagationEnd: false
    };

    let gestureList = {};

    // max time allowed between last touchmove and touchend
    const MAX_STATIC_TIME = 50;

    const SWIPE_DIRECTION_LEFT_OR_UP = -1;
    const SWIPE_DIRECTION_RIGHT_OR_DOWN = 1;
    const MIN_DELTA_FOR_DIRECTION_CHANGE = 5; // px

    const TOUCH_MODE = 'touch';
    const MOUSE_MODE = 'mouse';
    const POINTER_MODE = 'pointer';
    const CLICK_ONLY_MODE = 'click';

    const EVENTS_NAME = (function() {
        let start, move, end, mode, click;

        click = 'click';
        mode = CLICK_ONLY_MODE;

        if ('ontouchstart' in document) {
            start = 'touchstart';
            move = 'touchmove';
            end = 'touchend';
            mode = TOUCH_MODE;
        } else if (window.PointerEvent) {
            start = 'pointerdown';
            move = 'pointermove';
            end = 'pointerup';
            mode = POINTER_MODE;
        } else if (window.MSPointerEvent) {
            start = 'MSPointerDown';
            move = 'MSPointerMove';
            end = 'MSPointerUp';
            mode = POINTER_MODE;
        } else if ('onmousedown' in document) {
            start = 'mousedown';
            move = 'mousemove';
            end = 'mouseup';
            mode = MOUSE_MODE;
        }

        return {
            start,
            move,
            end,
            click,
            mode,
            hasTouch: mode !== CLICK_ONLY_MODE
        };
    })();

    function getPos(e) {
        let obj;

        if (EVENTS_NAME.mode === POINTER_MODE || EVENTS_NAME.mode === MOUSE_MODE) {
            if (e.pageX) {
                obj = {
                    pageX: e.pageX,
                    pageY: e.pageY,
                    clientX: e.clientX,
                    clientY: e.clientY
                };
            } else {
                obj = e.originalEvent;

                // Event may have an overlay due to library like 'bean' or 'jQuery'
                while (obj && obj.pageX === undefined) {
                    obj = obj.originalEvent;
                }
            }
        } else if (
            e.changedTouches &&
            e.changedTouches[0] &&
            e.changedTouches[0].pageX !== undefined
        ) {
            obj = e.changedTouches[0];
        }

        return {
            pageX: obj ? obj.pageX : -1,
            pageY: obj ? obj.pageY : -1,
            clientX: obj ? obj.clientX : -1,
            clientY: obj ? obj.clientY : -1,
            mode: EVENTS_NAME.mode
        };
    }


    function bindEvent($elem, eventsName, selector, callback, options) {
        let eventOptions;

        // Fix passive event on chrome 54+
        let fixPassiveEvent =
            (eventsName === EVENTS_NAME.start && (options.preventStart || options.stopPropagationStart)) ||
            (eventsName === EVENTS_NAME.move && (options.preventMove || options.stopPropagationMove));

        if (fixPassiveEvent) {
            eventOptions = {
                passive: false
            };
        }

        on($elem, {
            eventsName,
            selector,
            callback,
            eventOptions
        });
    }

    function unbindEvent($elem, eventsName, callback) {
        off($elem, {
            eventsName,
            callback
        });
    }


    function eventsHelper(e, eventName, options, $currentTargetElement) {
        let preventDefault, stopPropagation;

        preventDefault = options[`prevent${eventName}`];
        stopPropagation = options[`stopPropagation${eventName}`];

        if (
            (typeof preventDefault === 'function' &&
                preventDefault.call($currentTargetElement, e, $currentTargetElement)) ||
            (typeof preventDefault !== 'function' && preventDefault)
        ) {
            e.preventDefault();
        }

        if (
            (typeof stopPropagation === 'function' &&
                stopPropagation.call($currentTargetElement, e, $currentTargetElement)) ||
            (typeof stopPropagation !== 'function' && stopPropagation)
        ) {
            e.stopPropagation();
        }
    }

    /* -------------------- MANAGER */

    function GestureManager($element, options) {
        let isAllCancelled,
            isTapCancelled,
            isTapEventFired,
            isSwipeLeftFired,
            isSwipeRightFired,
            isSwipeUpFired,
            isSwipeDownFired,
            velocityVars,
            velocityArray,
            startX,
            startY,
            currentX,
            currentY,
            lastX,
            lastY,
            deltaX,
            deltaY,
            lastTouchMoveTime,
            lastDirections,
            $currentTargetElement;

        velocityArray = [];
        this.$element = $element;

        function cancelAll() {
            isAllCancelled = true;
            isTapCancelled = true;
            unbindEvent(document.body, EVENTS_NAME.move, onMove);
            unbindEvent(document.body, EVENTS_NAME.end, onEnd);
        }

        function init() {
            isAllCancelled = false;
            isTapCancelled = false;
            isTapEventFired = false;
            isSwipeLeftFired = false;
            isSwipeRightFired = false;
            isSwipeUpFired = false;
            isSwipeDownFired = false;
            lastTouchMoveTime = -1;
            lastDirections = {
                vert: 0,
                horiz: 0
            };

            if (options.swipe) {
                velocityVars = {
                    startTime: 0,
                    endTime: 0,
                    startPosX: 0,
                    endPosX: 0,
                    startPosY: 0,
                    endPosY: 0
                };

                velocityArray.length = 0;
            }
        }

        // Swipe are called only one time
        function handleSwipe(e) {
            if (Math.abs(deltaX) >= options.threshold) {
                isTapCancelled = true;

                if (deltaX > 0) {
                    if (!isSwipeLeftFired && options.swipeLeft) {
                        isSwipeLeftFired = true;
                        options.swipeLeft.call(e.target, e, $currentTargetElement, 'swipeLeft');
                    }
                } else {
                    if (!isSwipeRightFired && options.swipeRight) {
                        isSwipeRightFired = true;
                        options.swipeRight.call(e.target, e, $currentTargetElement, 'swipeRight');
                    }
                }
            } else if (Math.abs(deltaY) >= options.threshold) {
                isTapCancelled = true;

                if (deltaY > 0) {
                    if (!isSwipeUpFired && options.swipeUp) {
                        isSwipeUpFired = true;
                        options.swipeUp.call(e.target, e, $currentTargetElement, 'swipeUp');
                    }
                } else {
                    if (!isSwipeDownFired && options.swipeDown) {
                        isSwipeDownFired = true;
                        options.swipeDown.call(e.target, e, $currentTargetElement, 'swipeDown');
                    }
                }
            }
        }

        // Called along with touchmove
        function handleMove(e) {
            let moveOnX =
                Math.abs(currentX - lastX) > Math.abs(currentY - lastY);

            if (moveOnX && currentX < lastX) {
                if (options.moveLeft) {
                    options.moveLeft.call(e.target, e, $currentTargetElement, 'moveLeft');
                }
            } else if (moveOnX && currentX > lastX) {
                if (options.moveRight) {
                    options.moveRight.call(e.target, e, $currentTargetElement, 'moveRight');
                }
            }

            if (!moveOnX && currentY < lastY) {
                if (options.moveUp) {
                    options.moveUp.call(e.target, e, $currentTargetElement, 'moveUp');
                }
            } else if (!moveOnX && currentY > lastY) {
                if (options.moveDown) {
                    options.moveDown.call(e.target, e, $currentTargetElement, 'moveDown');
                }
            }
        }

        function handleVelocity(mustReset) {
            let velocityDistance, deltaTime;

            velocityVars.startPosX = velocityVars.endPosX;
            velocityVars.startPosY = velocityVars.endPosY;
            velocityVars.endPosX = currentX;
            velocityVars.endPosY = currentX;

            velocityVars.startTime = velocityVars.endTime || Date.now();
            velocityVars.endTime = Date.now();

            velocityDistance = Math.sqrt(
                Math.pow(velocityVars.endPosX - velocityVars.startPosX, 2) +
                    Math.pow(velocityVars.endPosY - velocityVars.startPosY, 2)
            );

            deltaTime = velocityVars.endTime - velocityVars.startTime;

            if (mustReset) {
                velocityArray.length = 0;
            }

            if (velocityDistance === 0 || deltaTime === 0) {
                return;
            }

            velocityArray.push({
                velocity: (velocityDistance * 1000) / deltaTime,
                velocityDistance,
                deltaTime
            });
        }

        function fuzzyEquals(angle, targetAngle) {
            return (
                angle >= targetAngle - options.angleThreshold &&
                angle <= targetAngle + options.angleThreshold
            );
        }

        function getVelocityData() {
            let angleDistance,
                angle,
                direction,
                deltaPosX,
                deltaPosY,
                averageVelocity,
                instantVelocity,
                currentTime;

            currentTime = new Date().valueOf();

            if (
                velocityArray.length === 0 ||
                // The pointer stay on the same place for more than MAX_STATIC_TIME
                (lastTouchMoveTime > 0 &&
                    currentTime - lastTouchMoveTime > MAX_STATIC_TIME)
            ) {
                return {
                    velocity: -1, // px / seconds
                    averageVelocity: -1, // px / seconds
                    angle: -1, // deg
                    direction: 'none'
                };
            }

            averageVelocity =
                velocityArray.reduce((sum, value) => sum + value.velocity, 0) /
                velocityArray.length;
            instantVelocity = velocityArray[velocityArray.length - 1];

            deltaPosX = currentX - startX;
            deltaPosY = currentY - startY;
            angleDistance = Math.sqrt(
                Math.pow(deltaPosX, 2) + Math.pow(deltaPosY, 2)
            );

            angle = Math.acos(Math.abs(deltaPosX) / angleDistance);
            angle = (angle * 180) / Math.PI;

            if (deltaPosX > 0 && deltaPosY > 0) {
                direction = 'down-right';
                angle = 360 - angle;

                if (fuzzyEquals(angle, 360)) {
                    direction = 'right';
                    angle = 0;
                } else if (fuzzyEquals(angle, 270)) {
                    direction = 'down';
                    angle = 270;
                }
            } else if (deltaPosX > 0 && deltaPosY < 0) {
                direction = 'up-right';

                if (fuzzyEquals(angle, 360)) {
                    direction = 'right';
                    angle = 0;
                } else if (fuzzyEquals(angle, 90)) {
                    direction = 'up';
                    angle = 90;
                }
            } else if (deltaPosX < 0 && deltaPosY > 0) {
                direction = 'down-left';
                angle = angle + 180;

                if (fuzzyEquals(angle, 180)) {
                    direction = 'left';
                    angle = 180;
                } else if (fuzzyEquals(angle, 270)) {
                    direction = 'down';
                    angle = 270;
                }
            } else if (deltaPosX < 0 && deltaPosY < 0) {
                direction = 'up-left';
                angle = 180 - angle;

                if (fuzzyEquals(angle, 180)) {
                    direction = 'left';
                    angle = 180;
                } else if (fuzzyEquals(angle, 90)) {
                    direction = 'up';
                    angle = 90;
                }
            }

            return {
                velocity:
                    options.velocityMax < 0
                        ? instantVelocity.velocity
                        : Math.min(
                              options.velocityMax,
                              instantVelocity.velocity
                          ),
                averageVelocity:
                    options.velocityMax < 0
                        ? averageVelocity
                        : Math.min(options.velocityMax, averageVelocity), // px / seconds
                angle: angle, // deg
                direction: direction
            };
        }

        function onStart(e) {
            let touchCoords;

            eventsHelper(e, 'Start', options, this);

            // Multitouch not handle for now
            if (e.touches && e.touches.length > 1) {
                $currentTargetElement = null;
                cancelAll();
                return;
            }

            touchCoords = getPos(e);

            $currentTargetElement = this;

            if (options.start) {
                options.start.call($currentTargetElement, e, $currentTargetElement, touchCoords, 'start');
            }

            init();

            if (touchCoords.pageX > -1) {
                currentX = startX = lastX = touchCoords.pageX;
                currentY = startY = lastY = touchCoords.pageY;

                bindEvent(
                    document.body,
                    EVENTS_NAME.move,
                    null,
                    onMove,
                    options
                );
            }

            if (EVENTS_NAME.hasTouch && options.useTouch) {
                bindEvent(
                    document.body,
                    EVENTS_NAME.end,
                    null,
                    onEnd,
                    options
                );
            }
        }

        function onMove(e) {
            let touchCoords, currentDirections, hasDirectionChanged;

            eventsHelper(e, 'Move', options, $currentTargetElement);

            if (isAllCancelled) {
                return;
            }

            if (e.touches && e.touches.length > 1) {
                return cancelAll();
            }

            touchCoords = getPos(e);

            if (options.move) {
                options.move.call($currentTargetElement, e, $currentTargetElement, touchCoords, 'move');
            }

            currentDirections = {};

            // Move only on Y
            if (
                Math.abs(lastX - touchCoords.pageX) <=
                MIN_DELTA_FOR_DIRECTION_CHANGE
            ) {
                currentDirections.horiz = lastDirections.horiz;
            } else {
                currentDirections.horiz =
                    lastX - touchCoords.pageX > 0
                        ? SWIPE_DIRECTION_LEFT_OR_UP
                        : SWIPE_DIRECTION_RIGHT_OR_DOWN;
            }

            // Move only on X
            if (
                Math.abs(lastY - touchCoords.pageY) <=
                MIN_DELTA_FOR_DIRECTION_CHANGE
            ) {
                currentDirections.vert = lastDirections.vert;
            } else {
                currentDirections.vert =
                    lastY - touchCoords.pageY > 0
                        ? SWIPE_DIRECTION_LEFT_OR_UP
                        : SWIPE_DIRECTION_RIGHT_OR_DOWN;
            }

            hasDirectionChanged =
                lastDirections.vert !== currentDirections.vert ||
                lastDirections.horiz !== currentDirections.horiz;

            if (hasDirectionChanged) {
                startX = lastX;
                startY = lastY;
            }

            lastX = currentX;
            lastY = currentY;
            currentX = touchCoords.pageX;
            currentY = touchCoords.pageY;
            deltaX = startX - currentX;
            deltaY = startY - currentY;
            lastTouchMoveTime = new Date().valueOf();

            if (options.swipe) {
                handleVelocity(hasDirectionChanged);
            }

            lastDirections = currentDirections;

            handleSwipe(e);
            handleMove(e);
        }

        function onEnd(e) {
            eventsHelper(e, 'End', options, $currentTargetElement);
            unbindEvent(document.body, EVENTS_NAME.move, onMove);
            unbindEvent(document.body, EVENTS_NAME.end, onEnd);

            if (options.end) {
                options.end.call($currentTargetElement, e, $currentTargetElement, getPos(e), 'end');
            }

            if (!isTapCancelled && !isTapEventFired && options.tap) {
                options.tap.call($currentTargetElement, e, $currentTargetElement, getPos(e), 'tap');
                isTapEventFired = true;
            }

            if (options.swipe) {
                let velocityData = getVelocityData();

                if (velocityData.averageVelocity >= 0) {
                    options.swipe.call($currentTargetElement, e, $currentTargetElement, velocityData, 'swipe');
                }
            }
        }

        function onClick(e) {
            eventsHelper(e, 'Click', options, $currentTargetElement);

            if (options.click) {
                options.click.call(this, e, this, getPos(e), 'click');
            }

            if (!isTapCancelled && !isTapEventFired && options.tap) {
                options.tap.call(this, e, this, getPos(e), 'tap');
                if (EVENTS_NAME.mode !== CLICK_ONLY_MODE) {
                    isTapEventFired = true;
                }
            }
        }

        this.destroy = () => {
            if (EVENTS_NAME.hasTouch && options.useTouch) {
                unbindEvent($element, EVENTS_NAME.start, onStart);
                unbindEvent(document.body, EVENTS_NAME.move, onMove);
                unbindEvent(document.body, EVENTS_NAME.end, onEnd);
            }

            unbindEvent($element, EVENTS_NAME.click, onClick);
        };

        if (EVENTS_NAME.hasTouch && options.useTouch) {
            bindEvent(
                $element,
                EVENTS_NAME.start,
                options.selector,
                onStart,
                options
            );
        }

        bindEvent(
            $element,
            EVENTS_NAME.click,
            options.selector,
            onClick,
            options
        );
    }

    /* -------------------- API */

    function addManager($element, handlerName, options) {
        let handler = gestureList[handlerName];

        if (!handler) {
            gestureList[handlerName] = handler = [];
        }


        handler.push(new GestureManager($element, options));

        return {
            "off": function() {
                removeManager($element, handlerName);
            }
        };
    }

    function removeManager($element, handlerName) {
        let idx = 0;
        let handler = gestureList[handlerName];

        if (!handler || !handler.length) {
            return;
        }

        while (idx < handler.length) {
            let manager = handler[idx];

            if (manager.$element === $element) {
                manager.destroy();
                handler.splice(idx, 1);
            } else {
                idx++;
            }
        }
    }

    gesture = function($elements, handlerName, userOptions = {}) {
        let options = extend(defaultOptions, userOptions), managers;

        if (
            typeof $elements.length === 'number' &&
            $elements.tagName !== 'FORM'
        ) {
            managers = [];
            $elements.forEach($element => {
                managers.push(addManager($element, handlerName, options));
                return managers;
            });
        } else {
            return addManager($elements, handlerName, options);
        }
    };

    gestureOff = function($elements, handlerName) {
        if (
            typeof $elements.length === 'number' &&
            $elements.tagName !== 'FORM'
        ) {
            $elements.forEach($element => {
                removeManager($element, handlerName);
            });
        } else {
            removeManager($elements, handlerName);
        }
    };
}

export { gesture, gestureOff };
