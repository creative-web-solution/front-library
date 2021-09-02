import { on, off }        from '../../Events/EventsManager';
import { extend }         from '../../Helpers/Extend';
import Popin              from './Popin';
import PopinBackground    from './PopinBackground';
import { CLICK_EVENT_NAME, defaultOptions, toggleTabIndex } from './Tools';


/**
 * Create a controller tha manage all popin in the page
 * @class PopinController
 *
 * @see extra/modules/popin.md for details.
 *
 * @example
 * let controller = new PopinController( popinOptions );
 * popin.loadForm( $form );
 */
export default class PopinController {
    #options:    PopinOptionsType;
    #selectors:  PopinSelectorsOptionsType;
    #background: PopinBackground;
    #popin:      Popin;


    constructor( userOptions: PopinOptionsType = {}, $popin?: HTMLElement ) {

        if ( !( "AbortController" in window ) ) {
            throw 'This plugin uses fecth and AbortController. You may need to add a polyfill for this browser.';
        }

        this.#options = extend( defaultOptions, userOptions );

        this.#selectors = this.#options.selectors!;

        // global var, only one background for all popin
        this.#background = new PopinBackground( this, this.#options );

        this.#popin = new Popin( {
            ...this.#options
        },
        $popin,
        {
            "controller": this,
            "background": this.#background
         } );


        // ------------------- BINDING

        if ( $popin ) {
            toggleTabIndex( null, $popin, false );

            on( document.body,
                {
                    "eventsName": CLICK_EVENT_NAME,
                    "selector":   `a[href="#${ $popin.id }"]`,
                    "callback":   this.#openPopinHandler
                } );
            return;
        }

        on( document.body,
            {
                "eventsName": CLICK_EVENT_NAME,
                "selector":  this.#selectors.links,
                "callback":  this.#openPopinHandler

            } );
        on( document.body,
            {
                "eventsName": "submit",
                "selector":  this.#selectors.forms,
                "callback":  this.#openPopinHandler

            } );

        let $triggerOnLoadPopin = document.querySelector( `[${ this.#selectors.openOnLoadAttribute }]` );

        if ( $triggerOnLoadPopin ) {
            this.parseElement(
                $triggerOnLoadPopin as HTMLElement,
                $triggerOnLoadPopin.getAttribute( this.#selectors.openOnLoadAttribute! )
            );
        }
    }


    private parseElement( $dom: HTMLElement, customUrl?: string | null ): Promise<void> {
        if ( customUrl ) {
            return this.#popin.load( customUrl );
        }

        if ( $dom.nodeName === 'FORM' ) {
            return this.#popin.loadForm( $dom as HTMLFormElement );
        }

        const anchor = $dom.getAttribute( 'href' );

        if ( anchor && anchor.indexOf( '#' ) === 0 ) {
            return this.#popin.open();
        }

        return this.#popin.loadLink( $dom as HTMLAnchorElement );
    }



    #openPopinHandler = ( e ) => {
        e.preventDefault();

        this.parseElement( e.target );
    }


    /**
     * Load a file and display it in the popin
     *
     * @param url
     * @param data - All parameters available for window.fetch
     * @param [type=text]
     */
    load( url: string, data: RequestInit, type?: PopinResponseType ): Promise<void> {
        return this.#popin.load( url, data, type );
    };


    /**
     * Send a form and display the result it in the popin
     *
     * @param $form
     */
    loadForm( $form: HTMLFormElement ): Promise<void> {
        return this.#popin.loadForm( $form );
    };


    /**
     * Load a page from a link and display the result it in the popin
     *
     * @param $link
     */
    loadLink( $link: HTMLAnchorElement ): Promise<void> {
        return this.#popin.loadLink( $link );
    };


    /**
     * Insert some html in the popin and open it
     *
     * @param html
     * @param openFirst - Open the popin THEN insert the html
     */
    set( html: string, openFirst?: boolean ): Promise<void> {
        return this.#popin.set( html, openFirst );
    };


    /**
     * Remove the content of the popin
     */
    clear() {
        return this.#popin.clear();
    };


    /**
     * Close the popin
     */
    close(): Promise<void> {
        return this.#popin.close();
    };


    /**
     * Open the popin
     */
    open(): Promise<void> {
        return this.#popin.open();
    };


    /**
     * Remove all events, css class or inline styles
     */
    destroy() {
        this.#background.destroy();
        this.#popin.destroy();

        off(
            document.body,
            {
                "eventsName": `${ CLICK_EVENT_NAME } submit`,
                "callback":   this.#openPopinHandler
            }
        );
    };

}
