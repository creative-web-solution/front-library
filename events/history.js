import { on } from 'front-library/Events/EventsManager';
import { UrlParser } from 'front-library/Helpers/UrlParser';
import { slice } from 'front-library/Helpers/slice';

/**
 * @typedef {object} state_Object
 * @memberof HistoryController
 * @property {string} url
 * @property {object} state - Native browser state object
 * @property {string} title
 */
/**
 * @callback HistoryController_Callback
 * @memberof HistoryController
 * @param {string} url
 * @param {object} state - Native browser state object
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
export function HistoryController(defaultTitle) {
    let $window,
        hasPushstate,
        hasPopStateEvent,
        currentState,
        registeredFunctionList

    $window = window
    hasPushstate = !!$window.history.pushState
    hasPopStateEvent = 'onpopstate' in $window

    registeredFunctionList = []

    defaultTitle = defaultTitle || document.querySelector('title').textContent
    defaultTitle = encodeURIComponent(defaultTitle)

    currentState = {
        url: new UrlParser(window.location),
        state: {},
        title: defaultTitle
    }


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
    function callRegisteredFunction(url, state) {
        if (!registeredFunctionList.length) {
            return
        }

        registeredFunctionList.forEach(handler => handler(url, state))
    }

    // popState handler
    function popStateHandler(e) {
        let state

        state = e.state

        if (!state) {
            return
        }

        currentState = {
            url: new UrlParser(document.location),
            state: state
        }

        callRegisteredFunction(currentState.url, state)
    }

    /**
     * Push a new state in the history
     *
     * @param {object} state - Native browser state object
     * @param {string} title
     * @param {string} url
     */
    this.pushState = (state, title, url) => {
        if (!hasPushstate) {
            return
        }

        url =
            url instanceof UrlParser ? url : new UrlParser(url)

        currentState = {
            url: url,
            state: state,
            title: title ? encodeURIComponent(title) : defaultTitle
        }

        try {
            $window.history.pushState(
                state,
                currentState.title,
                currentState.url.absolute2
            )
        } catch (e) {
            console.log(e)
        }
    }


    /**
     * Update the anchor of the current url
     *
     * @param {string} anchor
     */
    this.updateAnchor = anchor => {
        if (!hasPushstate) {
            return
        }

        anchor = anchor.indexOf('#') === -1 ? anchor : anchor.slice(1)

        try {
            currentState.url.setAnchor(anchor)
            $window.history.pushState(
                currentState.state,
                currentState.title,
                currentState.url.absolute2
            )
        } catch (e) {
            console.log(e)
        }
    }


    /**
     * Register an handler for popState
     *
     * @param {HistoryController_Callback} handler
     */
    this.register = handler => {
        registeredFunctionList.push(handler)
    }


    /**
     * Remove a registered handler for popState
     *
     * @param {Function} handler
     */
    this.remove = handler => {
        slice(registeredFunctionList, handler)
    }


    if (hasPopStateEvent) {
        on($window, {
            eventsName: "popstate",
            callback: popStateHandler
        });
    }
}
