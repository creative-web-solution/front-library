import { on }        from './EventsManager';
import { UrlParser } from '../Helpers/UrlParser';
import { slice }     from '../Helpers/Slice';


/**
 * Manage history pushState and popstate event
 *
 * @example
 * let h = new HistoryController( 'The default page title' )
 *
 * // Push a new state in the history
 * h.pushState( {data: 1}, 'The page title', '/path/page.html' )
 *
 * // Return the current page state
 * h.getState()
 *
 * // Update the anchor of the current url
 * h.updateAnchor( anchor )
 *
 * // Register an handler for popState
 * h.register( handler ) => ( url, state )
 *
 * // remove a registered handler for popState
 * h.remove( handler )
 *
 * @param defaultTitle - Default page title
 */
export default class HistoryController {
    #defaultTitle:           string;
    #hasPushstate:           boolean;
    #hasPopStateEvent:       boolean;
    #currentState:           HistoryStateObjectType;
    #registeredFunctionList: (( url: UrlParser, state: any ) => void)[];


    get state(): HistoryStateObjectType {
        return this.#currentState;
    }


    constructor( defaultTitle: string = '' ) {

        this.#hasPushstate     = !!window.history.pushState;
        this.#hasPopStateEvent = 'onpopstate' in window;

        this.#registeredFunctionList = []

        defaultTitle = defaultTitle || document.querySelector( 'title' )?.textContent || '';

        this.#defaultTitle = encodeURIComponent( defaultTitle );

        this.#currentState = {
            "url":   new UrlParser( window.location.href ),
            "state": {},
            "title": this.#defaultTitle
        };


        if ( this.#hasPopStateEvent ) {
            on( window, {
                "eventsName": "popstate",
                "callback":   this.#popStateHandler
            } );
        }
    }


    // Call each registered function for popstate event
    private callRegisteredFunction( url: UrlParser, state: any ): void {
        if ( !this.#registeredFunctionList.length ) {
            return;
        }

        this.#registeredFunctionList.forEach( handler => handler( url, state ) );
    }


    // popState handler
    #popStateHandler = ( e: PopStateEvent ): void => {
        const state = e.state;

        if ( !state ) {
            return;
        }

        this.#currentState = {
            "url": new UrlParser( document.location.href ),
            state,
            "title": ""
        };

        this.callRegisteredFunction( this.#currentState.url, state );
    }


    /**
     * Push a new state in the history
     *
     * @param state - Native browser state object
     * @param title
     * @param url
     */
    pushState( state: any, title: string, url: string | UrlParser ): this {
        if ( !this.#hasPushstate ) {
            return this;
        }

        url = url instanceof UrlParser ? url : new UrlParser( url as string );

        this.#currentState = {
            "url": url as UrlParser,
            state,
            "title": title ? encodeURIComponent( title ) : this.#defaultTitle
        };

        try {
            window.history.pushState(
                state,
                this.#currentState.title,
                this.#currentState.url.absolute2
            );
        }
        catch ( e ) {
            console.log( e );
        }

        return this;
    }


    /**
     * Update the anchor of the current url
     *
     * @param anchor
     */
    updateAnchor( anchor: string ): this {
        if ( !this.#hasPushstate ) {
            return this;
        }

        anchor = anchor.indexOf( '#' ) === -1 ? anchor : anchor.slice( 1 );

        try {
            this.#currentState.url.setAnchor( anchor );
            window.history.pushState(
                this.#currentState.state,
                this.#currentState.title,
                this.#currentState.url.absolute2
            );
        }
        catch ( e ) {
            console.log( e );
        }

        return this;
    }


    /**
     * Register an handler for popState
     *
     * @param handler
     */
    register( handler: HistoryCallbackType ): this {
        this.#registeredFunctionList.push( handler );

        return this;
    }


    /**
     * Remove a registered handler for popState
     *
     * @param handler
     */
    remove( handler: HistoryCallbackType ): this {
        slice( this.#registeredFunctionList, handler );

        return this;
    }
}
