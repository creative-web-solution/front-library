import { gesture, gestureOff } from './Gesture';
import { rClass, aClass }      from '../DOM/Class';
import { wait }                from '../Helpers/Wait';


/**
 * Simulate hover (on touch) on mobile device. Touch a second time to follow the link.
 *
 * @example
 * ```ts
 * new TouchHover( {
 *     "cssClass": 'hover',
 *     "selector": '.link',
 *     "$wrapper": $myWrapper
 * } );
 * ```
 */
export default class TouchHover {
    #options:                 FLib.Events.TouchHover.Options;
    #$lastElem:               Element | null = null;
    #hasClickOutsideListener: boolean;

    #$body                    = document.body;
    #hasBeenTouchedOnce       = Symbol( 'isTouchedOnce' );
    #gestureHandlerName       = Symbol( 'touchhover' );
    #clickOutsideHandlerName  = Symbol( 'touchhover2' );


    constructor( options: FLib.Events.TouchHover.Options ) {
        this.#options                 = options;
        this.#hasClickOutsideListener = false;
        this.#options.$wrapper        = this.#options.$wrapper || this.#$body;

        if ( !this.#options.cssClass || !this.#options.$wrapper || !this.#options.selector ) {
            return;
        }

        gesture( this.#options.$wrapper, this.#gestureHandlerName, {
            "selector":     this.#options.selector,
            "end":          this.#toggleClass.bind( this ),
            "preventClick": ( e, $target ) => {
                return $target[ this.#hasBeenTouchedOnce ];
            }
        } );
    }


    #onClickOutside = ( e: Event, $target: HTMLElement ): void => {

        if ( $target.closest( this.#options.selector ) ) {
            return;
        }

        gestureOff( this.#$body, this.#clickOutsideHandlerName );

        this.#hasClickOutsideListener = false;

        this.#removeClass();
    }


    #addClass = ( $target: HTMLElement ): void => {
        $target[ this.#hasBeenTouchedOnce ] = true;

        aClass( $target as HTMLElement, this.#options.cssClass );
        this.#$lastElem = $target;

        if ( !this.#hasClickOutsideListener ) {
            wait().then( () => {
                gesture( this.#$body, this.#clickOutsideHandlerName, {
                    "end": this.#onClickOutside.bind( this )
                } );
            } );

            this.#hasClickOutsideListener = true;
        }
    }


    #removeClass = (): void => {
        if ( this.#$lastElem ) {
            rClass( this.#$lastElem, this.#options.cssClass );

            this.#$lastElem[ this.#hasBeenTouchedOnce ] = false;
            this.#$lastElem = null;
        }
    }


    #toggleClass = ( e: Event, $target: HTMLElement ): void => {
        if ( $target !== this.#$lastElem ) {
            this.#removeClass();
        }

        if ( $target[ this.#hasBeenTouchedOnce ] ) {
            this.#removeClass();
            return;
        }

        this.#addClass( $target );
    }


    /**
     * Remove all binded events
     */
    destroy(): this {
        gestureOff( this.#options.$wrapper, this.#gestureHandlerName );
        gestureOff( this.#$body, this.#clickOutsideHandlerName );

        return this;
    }
}
