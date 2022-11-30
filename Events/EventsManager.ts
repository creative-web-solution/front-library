import { slice } from '../Helpers/Slice';


let passiveSupported = false,
    createEvt,
    DOMRegistry:    FLib.Events.EventsManager.DataRegistry[] = [],
    ObjectRegistry: FLib.Events.EventsManager.DataRegistry[] = [];


(function () {
    if ( typeof window.CustomEvent === 'function' ) {
        return;
    }

    function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        const evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
     }

    CustomEvent.prototype = window.Event.prototype;

    // @ts-expect-error
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
            // @ts-expect-error
            return window.CustomEvent( eventName, {
                "bubbles": typeof options.bubbles !== 'undefined' ? options.bubbles : true,
                "cancelable": typeof options.cancelable !== 'undefined' ? options.cancelable : true,
                "detail": options.detail
            } );
        }
    }
}() );

function passiveTestFnc() {return;}

(function () {
    try {
        const options = Object.defineProperty( {}, 'passive', {
            "get": () => {
                passiveSupported = true;
                return true;
            }
        } );


        window.addEventListener( 'test', passiveTestFnc, options );
        window.removeEventListener( 'test', passiveTestFnc, options );
    }
    catch( err ) {
        passiveSupported = false;
    }
}() );


function getDelegation( $element: Node, selector: string, callback: ( e: Event, $target: Element ) => void ) {
    return e => {
        const $target = e.target.closest( selector );

        if ( !$target || !$element.contains( $target ) ) {
            return;
        }

        callback.call( $target, e, $target );
    };
}


function exists( $element: Node, eventName: string, options: FLib.Events.EventsManager.OnOptions) {
    return ( $element instanceof Element ? DOMRegistry : ObjectRegistry ).find( item => {
        return item.$element === $element &&
                item.eventName === eventName &&
                item.options.callback === options.callback &&
                ( !options.selector || options.selector === item.options.selector );
    } );
}


function normalizeElements( $elements: any ) {
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
 */
export const handlePassiveEvents: boolean = passiveSupported;


/**
 * Add an event listener
 */
export const on = function( $elements: any, options: FLib.Events.EventsManager.OnOptions ): void {
    let eventOptions;

    const $ELEM_ARRAY = normalizeElements( $elements );

    if ( !options.eventsName ) {
        throw '[EVENT MANAGER]: Missing event name';
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
        ($ELEM_ARRAY as Element[] ).forEach( $element => {
            if ( exists( $element, eventName, options ) ) {
                return;
            }

            const useNativeDOMEvents = _useNativeDOMEvents( $element );
            const cbFunction = options._internalCallback || options.callback;

            const data: FLib.Events.EventsManager.DataRegistry = {
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
 */
export const one = function( $elements: any, options: FLib.Events.EventsManager.OnOptions ): void {

    function _internalCallback( this: any, e ) {
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
 */
export const off = function( $elements: any, options: FLib.Events.EventsManager.OffOptions ): void {

    const $ELEM_ARRAY = normalizeElements( $elements );

    options.eventsName.split( ' ' ).forEach( eventName => {
        $ELEM_ARRAY.forEach( $element => {
            const useNativeDOMEvents              = _useNativeDOMEvents( $element );
            const removedItem: FLib.Events.EventsManager.DataRegistry[] = [];
            let registry: FLib.Events.EventsManager.DataRegistry[]      = useNativeDOMEvents ? DOMRegistry : ObjectRegistry;

            registry.forEach( item => {
                if ( item.$element !== $element ) {
                    return;
                }
                const callback = item.delegate || item.options._internalCallback || item.options.callback;

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
 */
export const fire = function( $elements: any, options: FLib.Events.EventsManager.FireOptions ): void {
    const $ELEM_ARRAY = normalizeElements( $elements );

    options.eventsName.split(' ').forEach( eventName => {
        $ELEM_ARRAY.forEach( $element => {
            if ( _useNativeDOMEvents( $element ) ) {
                $element.dispatchEvent( createEvt( eventName, options ) );
                return;
            }

            const eventData = ObjectRegistry.filter( reg => reg.$element === $element && reg.eventName === eventName );

            eventData.forEach( reg => {
                reg.options[ reg.options._internalCallback ? '_internalCallback' : 'callback' ]?.call( reg.$element, options.detail );
            } );
        } );
    } );
}
