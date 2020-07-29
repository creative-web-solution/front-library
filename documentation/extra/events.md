## Keyboard handler


Callbacks are bound on 'keydown' events


```
import { KeyboardHandler } from 'front-library/Events/KeyboardHandler'

let keyboardControls = new KeyboardHandler(
    $domElement,
    {
        // Used for event delegation
        "selector":                     ".my-selector",

        // Prevent default on all key pressed, except TAB
        "preventDefault":               true,

        "onEnter":                      callback,
        "onSpace":                      callback,

        // Called when pressing ENTER or SPACE
        "onSelect":                     callback,

        "onEscape":                     callback,

        "onTab":                        callback,
        "onTabReverse":                 callback,

        // Called when pressing ARROW KEYS
        "onRight":                      callback,
        "onLeft":                       callback,
        "onUp":                         callback,
        "onDown":                       callback,

        "onPageUp":                     callback,
        "onPageDown":                   callback,

        // Called when pressing LEFT or DOWN arrow keys
        "onPrevious":                   callback,

        // Called when pressing RIGHT or UP arrow keys
        "onNext":                       callback,

        // Called on every key
        "onKey":                        callback
    }
);

keyboardControls.off();
```


Callbacks receive the original event in param and the DOM element as this.

```
function callback( event, $element )
{
    // this => DOM element on which the key is pressed
    // same as $element
}
```

You have access to:

* event.which || event.keyCode
* event.shiftKey
* event.altKey
* event.ctrlKey
* event.metaKey


### Note on TAB key handling:

**if onTabReverse is defined:**

* `onTabReverse` will be called only if the shift key **IS** pressed
* `onTab` will be called only if the shift ket **IS NOT** pressed


**if onTabReverse is undefined:**

* `onTab` callback will be called whatever if shift key is pressed or not

## Gestures

```
import { gesture, gestureOff } from 'front-library/Events/Gesture'

let gestureHanlder = gesture( $element, 'handlerName', options );

gestureOff( $element, 'handlerName' );

// or

gestureHanlder.off();
```

If you use an array of elements:

```
import { gesture, gestureOff } from 'EVENTS'

let gestureHanlder = gesture( $elements, 'handlerName', options );

gestureOff( $elements, 'handlerName' );

// or

gestureHanlder.forEach(gh => {gh.off()})
```


* $element => element (or array of elements) on which events will be bound. You can use event delegation, see defaultOptions.selector
* handlerName => Arbitrary name like 'myLinkTapHandler'. Used to remove binds in `gestureOff`.
* options => See defaultOptions below.


```
const defaultOptions = {
    // Used for event delegation
    "selector":                     ".my-class",

    // if moving less than threshold => it's a tap else it's a swipe
    "threshold":                    20, // in px

    // Used to compute direction name.
    // For exemple, if the angle is 91.3° and it's between (90-angleThreshold)° and (90+angleThreshold)°:
    // The direction is caculated as 'up' and not 'up-left'
    "angleThreshold":               2, // in deg

    // Use to cap returned velocity. If -1 the no capping
    "velocityMax":                  -1,

    // Use touch or pointer event, or just click ?
    "useTouch":                     true,

    // Callback on classic events
    // Can internally use pointer events instead of touchevent.
    "start":                        function(){},
    "move":                         function(){},
    "end":                          function(){},
    "click":                        function(){},

    // Called on touchend (if it's available on the device) or on click
    // Only one time, never on both
    "tap":                          function(){},

    // Swipe events are called only one time
    "swipeLeft":                    function(){},
    "swipeRight":                   function(){},
    "swipeUp":                      function(){},
    "swipeDown":                    function(){},

    // Called one time on touchend with the averageVelocity (px/s), velocity (px/s), angle (deg) and direction name
    "swipe":                        function(){},

    // Move events are called along with touchmove or pointermove events
    "moveLeft":                     function(){},
    "moveRight":                    function(){},
    "moveUp":                       function(){},
    "moveDown":                     function(){},

    "preventClick":                 true|false|function,
    "stopPropagationClick":         true|false|function,
    "preventStart":                 true|false|function,
    "stopPropagationStart":         true|false|function,
    "preventMove":                  true|false|function,
    "stopPropagationMove":          true|false|function,
    "preventEnd":                   true|false|function,
    "stopPropagationEnd":           true|false|function
};
```

### All callback function except for `swipe`, `start`, `move` and `end`:

```
function( e, $targetElement, eventName )
{
    // eventName = swipeLeft, tap, click, ...
}
```

Available event names:

* click
* tap
* swipeLeft
* swipeRight
* swipeUp
* swipeDown
* swipe
* moveLeft
* moveRight
* moveUp
* moveDown

### For `start`, `move`, `end`:

```
function( e, $targetElement, position, eventName )
{
    // position = {
        pageX,
        pageY,
        clientX,
        clientY,
        mode
    }
}
```

### For `swipe`:

```
function( e, $targetElement, data, eventName )
{
// with data = {
    // "velocity",          // last known velocity of the movement in px/seconds
    // "averageVelocity",   // average velocity of the whole movement in px/seconds
    // "angle",             // deg
    // "direction"          // 'up-right','left', ...
// }
```

Available directions:

* up
* up-right
* right
* down-right
* down
* down-left
* left
* up-left
