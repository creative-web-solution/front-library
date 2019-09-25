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
    let $lastElem, $body, hasClickOutsideListener;

    hasClickOutsideListener = false;
    $body = document.body;
    $wrapper = $wrapper || $body;

    function addClass( $elem ) {
        if ( $elem === $lastElem ) {
            return;
        }

        if ( $lastElem ) {
            $lastElem.classList.remove( cssClass );
        }

        $elem.classList.add( cssClass );
        $lastElem = $elem;

        if ( !hasClickOutsideListener ) {
            $body.addEventListener( 'touchstart', removeClass );
            hasClickOutsideListener = true;
        }
    }


    function removeClass( e ) {
        if ( e.target && e.target.closest(selector) === $lastElem ) {
            return;
        }

        $body.removeEventListener( 'touchstart', removeClass );
        hasClickOutsideListener = false;

        if ( $lastElem ) {
            $lastElem.classList.remove( cssClass );
            $lastElem = null;
        }
    }


    function toggleClass( e ) {
        if ( !e.target || !e.target.matches( selector ) ) {
            return;
        }

        e.stopPropagation()

        addClass( e.target );
    }


    /**
     * Remove all binded events
     *
     * @returns {TouchHover}
     */
    this.destroy = () => {
        $wrapper.removeEventListener( 'touchend', toggleClass );
        $body.removeEventListener( 'touchstart', removeClass );

        return this;
    }


    if ( !cssClass || !$wrapper || !selector ) {
        return;
    }

    $wrapper.addEventListener( 'touchend', toggleClass );
}
