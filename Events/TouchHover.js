import { gesture, gestureOff } from '@creative-web-solution/front-library/Events/Gesture';
import { rClass, aClass } from '@creative-web-solution/front-library/DOM/Class';
import { wait } from '@creative-web-solution/front-library/Helpers/wait';


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
export function TouchHover({ cssClass, selector, $wrapper }) {
    let $lastElem, hasClickOutsideListener;

    const $BODY           = document.body;
    const IS_TOUCHED_ONCE = Symbol( 'isTouchedOnce' );

    hasClickOutsideListener = false;
    $wrapper                 = $wrapper || $BODY;


    function addClass( $target ) {

        if ( $lastElem ) {
            rClass( $lastElem, cssClass );
        }

        aClass( $target, cssClass );
        $lastElem = $target;

        if ( !hasClickOutsideListener ) {
            wait().then( () => {
                gesture( $BODY, 'touchhover2', {
                    "end": removeClass
                } );
            } );
            hasClickOutsideListener = true;
        }

        $target[ IS_TOUCHED_ONCE ] = true;
    }


    function removeClass() {

        gestureOff( $BODY, 'touchhover2', {
            "end": removeClass
        } );
        hasClickOutsideListener = false;

        if ( $lastElem ) {
            rClass( $lastElem, cssClass );

            $lastElem[ IS_TOUCHED_ONCE ] = false;
            $lastElem = null;
        }
    }


    function toggleClass( e, $target ) {
        if ( $target !== $lastElem ) {
            removeClass();
        }

        if ( $target[ IS_TOUCHED_ONCE ] ) {
            removeClass();
            return;
        }

        addClass( $target );
    }


    /**
     * Remove all binded events
     *
     * @returns {TouchHover}
     */
    this.destroy = () => {

        gestureOff( $wrapper, 'touchhover', {
            "end": toggleClass
        } );

        gestureOff( $BODY, 'touchhover2', {
            "end": removeClass
        } );

        return this;
    }


    if ( !cssClass || !$wrapper || !selector ) {
        return;
    }


    gesture( $wrapper, 'touchhover', {
        "selector":     selector,
        "end":          toggleClass,
        "preventClick": ( e, $target ) => {
            return $target[ IS_TOUCHED_ONCE ];
        }
    } );
}
