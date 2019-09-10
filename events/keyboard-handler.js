/*dependencies: helpers::extend,events::event-manager */
import { on, off } from 'front-library/events/event-manager';
import { extend } from 'front-library/helpers/extend';

/**
 * @callback KeyboardHandler_Callback
 * @description Called when a key is pressed
 * @memberof KeyboardHandler
 * @param {event} event
 * @param {HTMLElement} $context - Targeted DOM element
 *
 */
/**
 * Handle keyboard typing on an elements
 * @class
 *
 * @param {HTMLElement} $element
 * @param {Object} userOptions
 * @param {string} [userOptions.selector] - Used for event delegation
 * @param {boolean} [userOptions.preventDefault=false] - Prevent default on all key pressed, except TAB
 * @param {KeyboardHandler_Callback} [userOptions.onEnter]
 * @param {KeyboardHandler_Callback} [userOptions.onSpace]
 * @param {KeyboardHandler_Callback} [userOptions.onSelect] - Called when pressing ENTER or SPACE
 * @param {KeyboardHandler_Callback} [userOptions.onEscape]
 * @param {KeyboardHandler_Callback} [userOptions.onTab]
 * @param {KeyboardHandler_Callback} [userOptions.onTabReverse]
 * @param {KeyboardHandler_Callback} [userOptions.onRight] - Called when pressing RIGHT ARROW KEYS
 * @param {KeyboardHandler_Callback} [userOptions.onLeft] - Called when pressing LEFT ARROW KEYS
 * @param {KeyboardHandler_Callback} [userOptions.onUp] - Called when pressing UP ARROW KEYS
 * @param {KeyboardHandler_Callback} [userOptions.onDown] - Called when pressing DOWN ARROW KEYS
 * @param {KeyboardHandler_Callback} [userOptions.onPageUp]
 * @param {KeyboardHandler_Callback} [userOptions.onPageDown]
 * @param {KeyboardHandler_Callback} [userOptions.onPrevious] - Called when pressing LEFT or DOWN arrow keys
 * @param {KeyboardHandler_Callback} [userOptions.onNext] - Called when pressing RIGHT or UP arrow keys
 * @param {KeyboardHandler_Callback} [userOptions.onKey] - Called on every key
 *
 * @see For more details, see extra/events.md
 *
 * @example let keyboardControls = new KeyboardHandler( $domElement, options );
 *
 * // To cancel events watching
 * keyboardControls.off();
 */
export function KeyboardHandler($element, userOptions = {}) {
    let defaultOptions = {
        preventDefault: true
    }

    let options

    const LEFT_KEY_CODE = 37
    const UP_KEY_CODE = 38
    const RIGHT_KEY_CODE = 39
    const DOWN_KEY_CODE = 40
    const TAB_KEY_CODE = 9
    const PAGE_UP_KEY_CODE = 33
    const PAGE_DOWN_KEY_CODE = 34
    const ENTER_KEY_CODE = 13
    const SPACE_KEY_CODE = 32
    const ESCAPE_KEY_CODE = 27
    const R_KEY_CODE = 82
    const P_KEY_CODE = 80
    const F5_KEY_CODE = 116

    options = extend(defaultOptions, userOptions)

    function handleCallbacks(event, $context, callbacks) {
        callbacks.forEach(cb => {
            if (options[cb]) {
                options[cb].call($context, event, $context)
            }
        })
    }

    function onKeypress(e) {
        let keyCode = e.which

        // Block all key except tab, CTRL R, CMD R or F5
        if (options.preventDefault &&
                keyCode !== TAB_KEY_CODE &&
                keyCode !== F5_KEY_CODE &&
                !(keyCode === R_KEY_CODE && (e.ctrlKey || e.metaKey)) &&
                !(keyCode === P_KEY_CODE && (e.ctrlKey || e.metaKey))

        ) {
            e.preventDefault();
        }

        handleCallbacks(e, e.target, ['onKey'])

        if (ENTER_KEY_CODE === keyCode) {
            handleCallbacks(e, e.target, ['onEnter', 'onSelect'])
        } else if (SPACE_KEY_CODE === keyCode) {
            handleCallbacks(e, e.target, ['onSpace', 'onSelect'])
        } else if (ESCAPE_KEY_CODE === keyCode) {
            handleCallbacks(e, e.target, ['onEscape'])
        } else if (RIGHT_KEY_CODE === keyCode) {
            handleCallbacks(e, e.target, ['onRight', 'onNext'])
        } else if (LEFT_KEY_CODE === keyCode) {
            handleCallbacks(e, e.target, ['onLeft', 'onPrevious'])
        } else if (UP_KEY_CODE === keyCode) {
            handleCallbacks(e, e.target, ['onUp', 'onNext'])
        } else if (DOWN_KEY_CODE === keyCode) {
            handleCallbacks(e, e.target, ['onDown', 'onPrevious'])
        } else if (PAGE_UP_KEY_CODE === keyCode) {
            handleCallbacks(e, e.target, ['onPageUp'])
        } else if (PAGE_DOWN_KEY_CODE === keyCode) {
            handleCallbacks(e, e.target, ['onPageDown'])
        } else if (TAB_KEY_CODE === keyCode) {
            if (e.shiftKey && options['onTabReverse']) {
                handleCallbacks(e, e.target, ['onTabReverse'])
                return
            }
            handleCallbacks(e, e.target, ['onTab'])
        }
    }

    /**
     * Remove the binding
     */
    this.off = () => {
        off($element, {
            "eventsName": "keydown",
            "callback": onKeypress
        });
    }


    on($element, {
        "eventsName": "keydown",
        "selector": options.selector,
        "callback": onKeypress
    });
}
