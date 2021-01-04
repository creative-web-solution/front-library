import { extend } from '@creative-web-solution/front-library/Helpers/Extend';
import { slice } from '@creative-web-solution/front-library/Helpers/slice';

/**
 * @callback IntersectObserver_Handler
 * @memberof IntersectObserver
 * @param {HTMLElement} $target
 * @param {IntersectionObserverEntry} entry - Native IntersectionObserver callback parameter
 * @param {DOMRectReadOnly} entry.boundingClientRect - { x, y, width, height, top, right, bottom, left }
 * @param {Number} entry.intersectionRatio
 * @param {DOMRectReadOnly} entry.intersectionRect
 * @param {Boolean} entry.isIntersecting
 * @param {DOMRectReadOnly} entry.rootBounds
 * @param {HTMLElement} entry.target
 * @param {DOMHighResTimeStamp} entry.time
 */
/**
 * Wrapper for the IntersectionObserver API
 * @class
 *
 * @example let io = new IntersectObserver( {
 *      "onIntersecting": callback
 * } );
 *
 * function callback( $target, entry ) {
 *      console.log( `${ $target } enter the screen viemport` );
 *      console.log( `${ $target } is intersecting the viewport: ${ entry.isintersecting }` );
 * }
 *
 * // To add an HTMLElement, a NodeList or an array of HTMLElement to the observer
 * io.add( $someHTMLElement );
 * io.add( [ $someHTMLElement2, $someHTMLElement3 ] );
 * io.add( $someNodList );
 *
 * // To remove an HTMLElement, a NodeList or an array of HTMLElement from the observer
 * io.remove( $someHTMLElement2 );
 * io.remove( $someNodList );
 *
 * // To remove all elements from the observer
 * io.clear();
 *
 * @param {Object} options
 * @param {IntersectObserver_Handler} options.onIntersecting - Callback function
 * @param {Boolean} [options.onlyOnce=false] - Execute the callback only once per $elements the first time it intersect the viewport
 * @param {Object} [options.ioOptions] - Native options to create to IntersectionObserver API
 * @param {HTMLElement} [options.ioOptions.root=null] - Element used as display. If null, use the screen viewport
 * @param {String} [options.ioOptions.rootMargin="0px"] - Margin around the viewport. Can be defined as margin css property: "10px 20px 30px 40px" (top, right, bottom, left)
 * @param {Float|Float[]} [options.ioOptions.threshold=0] - Percentage (0.0 to 1.0) of visibility needed to execute the callback function. To call the function when the visibility is at least 50%: threshold = 0.5. To call the function every 25%: threshold=[0, 0.25, 0.5, 0.75, 1]
 */
export function IntersectObserver( options ) {
    const _options = extend( {
        "onIntersecting": null,
        "onlyOnce": false,
        "ioOptions": {
            "root":         null,
            "rootMargin":   "0px",
            "threshold":    0
        }
    }, options );

    if ( !_options.onIntersecting ) {
        throw 'Missing "onIntersecting" callback function';
    }

    const OBSERVED_ELEMENTS = [];
    const ELEMENT_OBSERVER = new IntersectionObserver( intersect, _options.ioOptions );

    function intersect( entries ) {
        entries.forEach( function( entry ) {
            if ( _options.onlyOnce && entry.isIntersecting ) {
                _options.onIntersecting.call( entry.target, entry.target, entry );
                unobserve( entry.target );
                return;
            }
            else if ( !_options.onlyOnce ) {
                _options.onIntersecting.call( entry.target, entry.target, entry );
            }
        } );
    }


    function unobserve( $element ) {
        ELEMENT_OBSERVER.unobserve( $element );
        slice( OBSERVED_ELEMENTS, $element )
    }


    function observe( $element ) {
        if ( OBSERVED_ELEMENTS.includes( $element ) ) {
            return;
        }

        ELEMENT_OBSERVER.observe( $element );
    }


    function toggle( $elements, isAddAction ) {
        if ( ( $elements instanceof NodeList || $elements instanceof Array ) && typeof $elements.forEach !== 'undefined' ) {
            $elements.forEach( function( $element ) {
                isAddAction ? observe( $element ) : unobserve( $element );
            } );

            return;
        }

        isAddAction ? observe( $elements ) : unobserve( $elements );
    }


    /**
     * Add elements to be observed
     *
     * @memberof IntersectObserver
     * @instance
     * @function add
     *
     * @param {HTMLElement|HTMLElement[]} $elements
     *
     * @returns {IntersectObserver}
     */
    this.add = $elements => {
        toggle( $elements, true );

        return this;
    }


    /**
     * Stop some elements to be observed
     *
     * @memberof IntersectObserver
     * @instance
     * @function remove
     *
     * @param {HTMLElement|HTMLElement[]} $elements
     *
     * @returns {IntersectObserver}
     */
    this.remove = $elements => {
        toggle( $elements, false );

        return this;
    }


    /**
     * Stop all elements to be observed
     *
     * @memberof IntersectObserver
     * @instance
     * @function clear
     *
     * @returns {IntersectObserver}
     */
    this.clear = () => {
        if ( !ELEMENT_OBSERVER.length ) {
            return this;
        }

        toggle( ELEMENT_OBSERVER, false );

        ELEMENT_OBSERVER.length = 0;

        return this;
    }
}
