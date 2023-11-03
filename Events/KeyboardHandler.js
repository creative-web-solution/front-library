import { on, off } from '@creative-web-solution/front-library/Events/EventsManager';
import { extend } from '@creative-web-solution/front-library/Helpers/extend';

/**
 * @callback KeyboardHandler_Callback
 * @description Called when a key is pressed
 * @memberof KeyboardHandler
 * @param {Event} event
 * @param {HTMLElement} $context - Targeted DOM element
 *
 */
/**
 * Handle keyboard typing on an elements
 * @class
 *
 * @param {HTMLElement} $element
 * @param {Object} userOptions
 * @param {String} [userOptions.selector] - Used for event delegation
 * @param {Boolean} [userOptions.preventDefault=false] - Prevent default on all key pressed, except TAB
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
export function KeyboardHandler( $element, userOptions = {} ) {
    const DEFAULT_OPTIONS = {
        "preventDefault": true
    };

    const OPTIONS            = extend( DEFAULT_OPTIONS, userOptions );

    const LEFT_KEY_CODE      = 37;
    const UP_KEY_CODE        = 38;
    const RIGHT_KEY_CODE     = 39;
    const DOWN_KEY_CODE      = 40;
    const TAB_KEY_CODE       = 9;
    const PAGE_UP_KEY_CODE   = 33;
    const PAGE_DOWN_KEY_CODE = 34;
    const ENTER_KEY_CODE     = 13;
    const SPACE_KEY_CODE     = 32;
    const ESCAPE_KEY_CODE    = 27;
    const R_KEY_CODE         = 82;
    const P_KEY_CODE         = 80;
    const F5_KEY_CODE        = 116;
    const EVENTS_NAME        = new Map();


    EVENTS_NAME.set( ENTER_KEY_CODE,     () => [ 'onEnter', 'onSelect' ] );
    EVENTS_NAME.set( SPACE_KEY_CODE,     () => [ 'onSpace', 'onSelect' ] );
    EVENTS_NAME.set( ESCAPE_KEY_CODE,    () => [ 'onEscape' ] );
    EVENTS_NAME.set( RIGHT_KEY_CODE,     () => [ 'onRight', 'onNext' ] );
    EVENTS_NAME.set( LEFT_KEY_CODE,      () => [ 'onLeft', 'onPrevious' ] );
    EVENTS_NAME.set( UP_KEY_CODE,        () => [ 'onUp', 'onNext' ] );
    EVENTS_NAME.set( DOWN_KEY_CODE,      () => [ 'onDown', 'onPrevious' ] );
    EVENTS_NAME.set( PAGE_UP_KEY_CODE,   () => [ 'onPageUp' ] );
    EVENTS_NAME.set( PAGE_DOWN_KEY_CODE, () => [ 'onPageDown' ] );
    EVENTS_NAME.set( TAB_KEY_CODE,       e => {
        if ( e.shiftKey && OPTIONS[ 'onTabReverse' ] ) {
            return [ 'onTabReverse' ];
        }
        return [ 'onTab' ];
    } );


    function handleCallbacks( event, $context, callbacks ) {
        callbacks.forEach( cb => {
            if ( OPTIONS[ cb ] ) {
                OPTIONS[ cb ].call( $context, event, $context );
            }
        } );
    }

    function onKeypress( e ) {
        let keyCode = e.which;

        // Block all key except tab, CTRL R, CMD R or F5
        if ( OPTIONS.preventDefault &&
                keyCode !== TAB_KEY_CODE &&
                keyCode !== F5_KEY_CODE &&
                !( keyCode === R_KEY_CODE && ( e.ctrlKey || e.metaKey ) ) &&
                !( keyCode === P_KEY_CODE && ( e.ctrlKey || e.metaKey ) )

        ) {
            e.preventDefault();
        }

        handleCallbacks( e, e.target, [ 'onKey' ] );

        if ( EVENTS_NAME.has( keyCode ) ) {
            handleCallbacks( e, e.target, EVENTS_NAME.get( keyCode )( e ) );
        }
    }

    /**
     * Add the binding
     *
     * @returns {KeyboardHandler}
     */
    this.on = () => {
        on( $element, {
            "eventsName": "keydown",
            "selector": OPTIONS.selector,
            "callback": onKeypress
        } );

        return this;
    }

    /**
     * Remove the binding
     *
     * @returns {KeyboardHandler}
     */
    this.off = () => {
        off( $element, {
            "eventsName": "keydown",
            "callback": onKeypress
        } );

        return this;
    }


    this.on();
}
