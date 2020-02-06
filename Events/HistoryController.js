import { on } from 'front-library/Events/EventsManager';
import { UrlParser } from 'front-library/Helpers/UrlParser';
import { slice } from 'front-library/Helpers/slice';

/**
 * @typedef {object} state_Object
 * @memberof HistoryController
 * @property {String} url
 * @property {Object} state - Native browser state object
 * @property {String} title
 */
/**
 * @callback HistoryController_Callback
 * @memberof HistoryController
 * @param {String} url
 * @param {oOject} state - Native browser state object
 */
/**
 * Manage history pushState and popstate event
 * @class
 *
 * @example let h = new HistoryController( 'The default page title' )
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
 * @param {string} defaultTitle - Default page title
 */
export function HistoryController( defaultTitle ) {
    let $window,
        hasPushstate,
        hasPopStateEvent,
        currentState,
        registeredFunctionList;

    $window = window;
    hasPushstate = !!$window.history.pushState;
    hasPopStateEvent = 'onpopstate' in $window;

    registeredFunctionList = []

    defaultTitle = defaultTitle || document.querySelector( 'title' ).textContent;
    defaultTitle = encodeURIComponent( defaultTitle );

    currentState = {
        "url": new UrlParser(window.location),
        "state": {},
        "title": defaultTitle
    };


    /**
     * Get the current page state
     *
     * @memberof HistoryController
     * @member {state_Object} state
     * @instance
     */
    Object.defineProperty( this, 'state', {
        "get": () => currentState
    } );


    // Call each registered function for popstate event
    function callRegisteredFunction( url, state ) {
        if ( !registeredFunctionList.length ) {
            return;
        }

        registeredFunctionList.forEach( handler => handler( url, state ) );
    }

    // popState handler
    function popStateHandler( e ) {
        let state;

        state = e.state;

        if ( !state ) {
            return;
        }

        currentState = {
            "url": new UrlParser( document.location ),
            state
        };

        callRegisteredFunction( currentState.url, state );
    }


    /**
     * Push a new state in the history
     *
     * @param {Object} state - Native browser state object
     * @param {String} title
     * @param {String} url
     *
     * @returns {HistoryController}
     */
    this.pushState = ( state, title, url ) => {
        if ( !hasPushstate ) {
            return this;
        }

        url = url instanceof UrlParser ? url : new UrlParser( url );

        currentState = {
            url,
            state,
            "title": title ? encodeURIComponent( title ) : defaultTitle
        };

        try {
            $window.history.pushState(
                state,
                currentState.title,
                currentState.url.absolute2
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
     * @param {String} anchor
     *
     * @returns {HistoryController}
     */
    this.updateAnchor = anchor => {
        if ( !hasPushstate ) {
            return
        }

        anchor = anchor.indexOf( '#' ) === -1 ? anchor : anchor.slice( 1 );

        try {
            currentState.url.setAnchor( anchor );
            $window.history.pushState(
                currentState.state,
                currentState.title,
                currentState.url.absolute2
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
     * @param {HistoryController_Callback} handler
     *
     * @returns {HistoryController}
     */
    this.register = handler => {
        registeredFunctionList.push( handler );

        return this;
    }


    /**
     * Remove a registered handler for popState
     *
     * @param {Function} handler
     *
     * @returns {HistoryController}
     */
    this.remove = handler => {
        slice( registeredFunctionList, handler );

        return this;
    }


    if ( hasPopStateEvent ) {
        on( $window, {
            "eventsName": "popstate",
            "callback": popStateHandler
        } );
    }
}
