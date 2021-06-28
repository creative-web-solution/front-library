import { gesture, gestureOff } from '@creative-web-solution/front-library/Events/Gesture';
import { rClass, aClass }      from '@creative-web-solution/front-library/DOM/Class';
import { wait }                from '@creative-web-solution/front-library/Helpers/Wait';


/**
 * Simulate hover (on touch) on mobile device. Touch a second time to follow the link.
 * @class
 *
 * @example new TouchHover( {
 *     "cssClass": 'hover',
 *     "selector": '.link',
 *     "$wrapper": $myWrapper
 * } );
 *
 * @param {Object} options
 * @param {String} options.cssClass
 * @param {String} options.selector
 * @param {HTMLEvent} options.$wrapper
 */
export default class TouchHover {
    #options:                 TouchHoverOptions ;
    #$lastElem:               Element | null = null;
    #hasClickOutsideListener: boolean;

    #$body                    = document.body;
    #hasBeenTouchedOnce       = Symbol( 'isTouchedOnce' );
    #gestureHandlerName       = Symbol( 'touchhover' );
    #clickOutsideHandlerName  = Symbol( 'touchhover2' );


    constructor( options: TouchHoverOptions ) {
        this.#options                 = options;
        this.#hasClickOutsideListener = false;
        this.#options.$wrapper        = this.#options.$wrapper || this.#$body;

        if ( !this.#options.cssClass || !this.#options.$wrapper || !this.#options.selector ) {
            return;
        }

        gesture( this.#options.$wrapper, this.#gestureHandlerName, {
            "selector":     this.#options.selector,
            "end":          this.toggleClass.bind( this ),
            "preventClick": ( e, $target ) => {
                return $target[ this.#hasBeenTouchedOnce ];
            }
        } );
    }


    private onClickOutside( e, $target ) {

        if ( $target.closest( this.#options.selector ) ) {
            return;
        }

        gestureOff( this.#$body, this.#clickOutsideHandlerName );

        this.#hasClickOutsideListener = false;

        this.removeClass();
    }


    private addClass( $target ) {
        $target[ this.#hasBeenTouchedOnce ] = true;

        aClass( $target, this.#options.cssClass );
        this.#$lastElem = $target;

        if ( !this.#hasClickOutsideListener ) {
            wait().then( () => {
                gesture( this.#$body, this.#clickOutsideHandlerName, {
                    "end": this.onClickOutside.bind( this )
                } );
            } );

            this.#hasClickOutsideListener = true;
        }
    }


    private removeClass() {
        if ( this.#$lastElem ) {
            rClass( this.#$lastElem, this.#options.cssClass );

            this.#$lastElem[ this.#hasBeenTouchedOnce ] = false;
            this.#$lastElem = null;
        }
    }


    private toggleClass( e, $target ) {
        if ( $target !== this.#$lastElem ) {
            this.removeClass();
        }

        if ( $target[ this.#hasBeenTouchedOnce ] ) {
            this.removeClass();
            return;
        }

        this.addClass( $target );
    }


    /**
     * Remove all binded events
     */
    destroy() {
        gestureOff( this.#options.$wrapper, this.#gestureHandlerName );
        gestureOff( this.#$body, this.#clickOutsideHandlerName );

        return this;
    }
}
