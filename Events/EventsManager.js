import { slice } from '@creative-web-solution/front-library/Helpers/slice';

let passiveSupported = false, DOMRegistry = [], ObjectRegistry = [], createEvt;

(function () {
    if ( typeof window.CustomEvent === "function" ) {
        return false;
    }

    function CustomEvent ( event, params ) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      const evt = document.createEvent( 'CustomEvent' );
      evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
      return evt;
     }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
} )();


(function () {
    try {
        if ( new window.CustomEvent( 'test' ) ) {
            createEvt = function( eventName, options ) {
                return new window.CustomEvent( eventName, {
                    "bubbles": typeof options.bubbles !== 'undefined' ? options.bubbles : true,
                    "cancelable": typeof options.cancelable !== 'undefined' ? options.cancelable : true,
                    "detail": options.detail
                } );
            }
        }
    }
    catch( err ) {
        createEvt = function( eventName, options ) {
            return window.CustomEvent( eventName, {
                "bubbles": typeof options.bubbles !== 'undefined' ? options.bubbles : true,
                "cancelable": typeof options.cancelable !== 'undefined' ? options.cancelable : true,
                "detail": options.detail
            } );
        }
    }
}() );


(function () {
    try {
        let options = Object.defineProperty( {}, "passive", {
            "get": () => {
                passiveSupported = true;
                return true;
            }
        } );

        window.addEventListener( "test", options, options );
        window.removeEventListener( "test", options, options );
    }
    catch( err ) {
        passiveSupported = false;
    }
}() );


function getDelegation( $element, selector, callback ) {
    return e => {
        let $target = e.target.closest( selector );

        if ( !$target || !$element.contains( $target ) ) {
            return;
        }

        callback.call( $target, e );
    };
}


function exists( $element, eventName, options ) {
    return ( $element instanceof Element ? DOMRegistry : ObjectRegistry ).find( item => {
        return item.$element === $element &&
                item.eventName === eventName &&
                item.options.callback === options.callback &&
                ( !options.selector || options.selector === item.options.selector );
    } );
}


function normalizeElements( $elements ) {
    if ( ( $elements instanceof NodeList || $elements instanceof Array ) && typeof $elements.forEach !== 'undefined' ) {
        return $elements;
    }

    return [ $elements ];
}


function _useNativeDOMEvents( $element ) {
    return 'addEventListener' in $element;
}


/**
 * Indicate if the browser natively support passive event
 *
 * @name handlePassiveEvents
 * @type {Boolean}
 */
export const handlePassiveEvents = passiveSupported;


/**
 * Add an event listener
 *
 * @function on
 *
 * @param { HTMLElement|Object|HTMLElement[]|Object[] } $elements
 * @param { Object } options
 * @param { String } options.eventsName - Name of events separate by a space
 * @param { Function } options.callback - Callback function
 * @param { String } [options.selector] - Css selector used for event delegation
 * @param { Boolean } [options.capture] - Active or not capture event.
 * @param { Object } [options.eventOptions] - Native addEventListener options. Priority to options.capture if it's present.
 * @param { Boolean } [options.eventOptions.capure]
 * @param { Boolean } [options.eventOptions.once]
 * @param { Boolean } [options.eventOptions.passive]
 */
export const on = function( $elements, options ) {
    let eventOptions;

    $elements = normalizeElements( $elements );

    if ( !options.eventsName ) {
        throw '[EVENT MANAGER]: Missing event names';
    }

    if ( !options.callback ) {
        throw '[EVENT MANAGER]: Missing callback function';
    }

    if ( typeof options.capture !== 'undefined' ) {
        eventOptions = options.capture;
    }
    else if ( options.eventOptions ) {
        eventOptions = passiveSupported ? options.eventOptions : options.capture;
    }

    options.eventsName.split( ' ' ).forEach( eventName => {
        $elements.forEach( $element => {
            if ( exists( $element, eventName, options ) ) {
                return;
            }

            let useNativeDOMEvents = _useNativeDOMEvents( $element );
            let cbFunction = options._internalCallback || options.callback;

            let data = {
                $element,
                eventName,
                options
            };

            if ( useNativeDOMEvents ) {
                if ( options.selector ) {
                    data.delegate = getDelegation( $element, options.selector, cbFunction );

                    $element.addEventListener( eventName, data.delegate, eventOptions );
                }
                else {
                    $element.addEventListener( eventName, cbFunction, eventOptions );
                }
                DOMRegistry.push( data );
            }
            else {
                ObjectRegistry.push( data );
            }
        } );
    } );
};


/**
 * Add an event listener fired only one time
 *
 * @function one
 *
 * @param { HTMLElement|Object|HTMLElement[]|Object[] } $elements
 * @param { Object } options
 * @param { String } options.eventsName - Name of events separate by a space
 * @param { String } [options.selector] - Css selector used for event delegation
 * @param { Functio } options.callback - Callback function
 * @param { Boolean } [options.capture] - Active or not capture event.
 * @param { Object } [options.eventOptions] - Native addEventListener options. Priority to options.capture if it's present.
 * @param { Boolean } [options.eventOptions.capure]
 * @param { Boolean } [options.eventOptions.once]
 * @param { Boolean } [options.eventOptions.passive]
 *
 */
export const one = function( $elements, options ) {

    function _internalCallback( e ) {
        off( $elements || this, options );
        options.callback.call( this, e );
    }

    on( $elements, {
        ...options,
        _internalCallback
    } );
};


/**
 * Remove an event
 *
 * @function off
 *
 * @param { HTMLElement|Object|HTMLElement[]|Object[] } $elements
 * @param { Object } options
 * @param { String } options.eventsName - Name of events separate by space
 * @param { Function } [options.callback] - Callback function
 *
 */
export const off = function( $elements, options ) {
    $elements = normalizeElements( $elements );

    options.eventsName.split( ' ' ).forEach( eventName => {
        $elements.forEach( $element => {
            let useNativeDOMEvents = _useNativeDOMEvents( $element );
            let registry = useNativeDOMEvents ? DOMRegistry : ObjectRegistry;
            let removedItem = [];

            registry.forEach( item => {
                let callback = item.delegate || item.options._internalCallback || item.options.callback;

                if ( !options.callback || options.callback === item.options.callback ) {
                    if ( useNativeDOMEvents ) {
                        $element.removeEventListener( eventName, callback );
                    }
                    removedItem.push( item );
                }
            } );

            removedItem.forEach( item => {
                registry = slice( registry, item );
            } );

            if ( useNativeDOMEvents ) {
                DOMRegistry = registry;
            }
            else {
                ObjectRegistry = registry;
            }
        } )
    } );
};


/**
 * Fire an event
 *
 * @function fire
 *
 * @param { HTMLElement|Object|HTMLElement[]|Object[] } $elements
 * @param { Object } options
 * @param { String } options.eventsName - Name of events separate by space
 * @param { Object } [options.detail] - Object to send with the event
 * @param { Boolean } [options.bubbles=true] - Only used for DOMM
 * @param { Boolean } [options.cancelable=true] - Only used for DOMM
 *
 */
export const fire = function( $elements, options ) {
    $elements = normalizeElements( $elements );

    options.eventsName.split(' ').forEach( eventName => {
        $elements.forEach( $element => {
            let useNativeDOMEvents = _useNativeDOMEvents( $element );

            if ( useNativeDOMEvents ) {
                $element.dispatchEvent( createEvt( eventName, options ) );
                return;
            }

            let eventData = ObjectRegistry.filter( reg => reg.$element === $element && reg.eventName === eventName );

            eventData.forEach( reg => {
                reg.options[ reg.options._internalCallback ? '_internalCallback' : 'callback' ].call( reg.$element, options.detail );
            } );
        } );
    } );
}
