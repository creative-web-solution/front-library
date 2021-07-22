import { extend } from '../Helpers/Extend';
import { slice }  from '../Helpers/Slice';


/**
 * Wrapper for the IntersectionObserver API
 *
 * @example
 * let io = new IntersectObserver( {
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
 * @param options
 */
export default class IntersectObserver {

    #elementObserver: IntersectionObserver;
    #options:         IntersectObserverOptionsType;
    #observedElements;


    constructor( options: IntersectObserverOptionsType ) {
        this.#options = extend( {
            "onIntersecting": null,
            "onlyOnce": false,
            "ioOptions": {
                "root":       null,
                "rootMargin": "0px",
                "threshold":  0
            }
        }, options );

        if ( !this.#options.onIntersecting ) {
            throw 'Missing "onIntersecting" callback function';
        }

        this.#observedElements = [];
        this.#elementObserver  = new IntersectionObserver( this.intersect.bind( this ), this.#options.ioOptions );
    }


    private intersect( entries: IntersectionObserverEntry[] ) {
        entries.forEach( ( entry: IntersectionObserverEntry ) => {
            if ( this.#options.onlyOnce && entry.isIntersecting ) {
                this.#options.onIntersecting.call( entry.target, entry.target, entry );
                this.unobserve( entry.target );
                return;
            }
            else if ( !this.#options.onlyOnce ) {
                this.#options.onIntersecting.call( entry.target, entry.target, entry );
            }
        } );
    }


    private unobserve( $element: Element ) {
        this.#elementObserver.unobserve( $element );
        slice( this.#observedElements, $element )
    }


    private observe( $element: Element ) {
        if ( this.#observedElements.includes( $element ) ) {
            return;
        }

        this.#elementObserver.observe( $element );

        this.#observedElements.push( $element  );
    }


    private toggle( $elements: Element | NodeList | Element[], isAddAction ) {
        if ( ( $elements instanceof NodeList || $elements instanceof Array ) && typeof $elements.forEach !== 'undefined' ) {
            $elements.forEach( $element => {
                isAddAction ? this.observe( $element ) : this.unobserve( $element );
            } );

            return;
        }

        isAddAction ? this.observe( $elements as Element ) : this.unobserve( $elements as Element );
    }


    /**
     * Add elements to be observed
     *
     * @param $elements
     */
    add( $elements: Element | NodeList | Element[] ): this {
        this.toggle( $elements, true );

        return this;
    }


    /**
     * Stop some elements to be observed
     *
     * @param $elements
     */
    remove( $elements: Element | NodeList | Element[] ): this {
        this.toggle( $elements, false );

        return this;
    }


    /**
     * Stop all elements to be observed
     */
    clear(): this {
        if ( !this.#observedElements.length ) {
            return this;
        }

        this.toggle( this.#observedElements, false );

        this.#observedElements.length = 0;

        return this;
    }
}
