import { on, off } from './EventsManager';
import { extend }  from '../Helpers/Extend';


/**
 * Handle keyboard typing on an elements
 *
 * @see For more details, see extra/events.md
 *
 * @example
 * const keyboardControls = new KeyboardHandler( $domElement, options );
 *
 * // To cancel events watching
 * keyboardControls.off();
 */
export default class KeyboardHandler {

    #$element;
    #options;
    #eventsName = new Map<string, ( e: KeyboardEvent ) => string[]>();


    constructor( $element: Element, userOptions: FLib.Events.KeyboardHandler.Options = {} ) {

        this.#$element = $element;

        const DEFAULT_OPTIONS = {
            "preventDefault": true
        };

        this.#options            = extend( DEFAULT_OPTIONS, userOptions );

        this.#eventsName.set( 'Enter',      () => [ 'onEnter', 'onSelect' ] );
        this.#eventsName.set( ' ',          () => [ 'onSpace', 'onSelect' ] );
        this.#eventsName.set( 'Esc',        () => [ 'onEscape' ] );
        this.#eventsName.set( 'Escape',     () => [ 'onEscape' ] );
        this.#eventsName.set( 'Right',      () => [ 'onRight', 'onNext' ] );
        this.#eventsName.set( 'ArrowRight', () => [ 'onRight', 'onNext' ] );
        this.#eventsName.set( 'Left',       () => [ 'onLeft', 'onPrevious' ] );
        this.#eventsName.set( 'ArrowLeft',  () => [ 'onLeft', 'onPrevious' ] );
        this.#eventsName.set( 'Up',         () => [ 'onUp', 'onNext' ] );
        this.#eventsName.set( 'ArrowUp',    () => [ 'onUp', 'onNext' ] );
        this.#eventsName.set( 'Down',       () => [ 'onDown', 'onPrevious' ] );
        this.#eventsName.set( 'ArrowDown',  () => [ 'onDown', 'onPrevious' ] );
        this.#eventsName.set( 'PageUp',     () => [ 'onPageUp' ] );
        this.#eventsName.set( 'PageDown',   () => [ 'onPageDown' ] );
        this.#eventsName.set( 'Tab',       ( e: KeyboardEvent ) => {
            if ( e.shiftKey && this.#options[ 'onTabReverse' ] ) {
                return [ 'onTabReverse' ];
            }
            return [ 'onTab' ];
        } );

        this.on();
    }


    #handleCallbacks = ( event: KeyboardEvent, $context: EventTarget | null, callbacks: string[] ): void => {
        callbacks.forEach( cb => {
            if ( this.#options[ cb ] ) {
                this.#options[ cb ].call( $context, event, $context );
            }
        } );
    }


    #onKeypress = ( e: KeyboardEvent ): void => {
        const key = e.key;

        // Block all key except tab, CTRL R, CMD R or F5
        if ( this.#options.preventDefault &&
                key !== 'Tab' &&
                key !== 'F5' &&
                !( key === 'r' && ( e.ctrlKey || e.metaKey ) ) &&
                !( key === 'p' && ( e.ctrlKey || e.metaKey ) )

        ) {
            e.preventDefault();
        }

        this.#handleCallbacks( e, e.target, [ 'onKey' ] );

        const FNC = this.#eventsName.get( key );

        if ( FNC ) {
            this.#handleCallbacks( e, e.target, FNC( e ) );
        }
    }


    /**
     * Add the binding
     */
     on(): this {
        on( this.#$element, {
            "eventsName": "keydown",
            "selector":   this.#options.selector,
            "callback":   this.#onKeypress
        } );

        return this;
    }


    /**
     * Remove the binding
     */
    off(): this {
        off( this.#$element, {
            "eventsName": "keydown",
            "callback":   this.#onKeypress
        } );

        return this;
    }
}
