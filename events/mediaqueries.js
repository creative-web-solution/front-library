/*dependencies: helpers::slice */
import { extend } from 'front-library/helpers/extend';
import { slice } from 'front-library/helpers/slice';

/**
 * @callback MediaQueriesEvents_Handler
 * @memberof MediaQueriesEvents
 * @param {Breakpoint} breakpoint
 */
/**
 * @typedef Breakpoint
 * @memberof MediaQueriesEvents
 * @property {string} name
 * @property {object} query - Object buid with the window.matchMedia() function
 * @property {number} [min] - mediaquery lower bound
 * @property {number} [max] - mediaquery upper bound
 * @property {function} in - Return true if the breakpoint is in the list: breakpoint.in(['bp1', 'bp2'])
 * @property {function} is - Return true if the name passed to the function is the name of the breakpoint: breakpoint.is('bp1')
 *
*/
/**
 * Manage mediaqueries events
 * @class
 *
 * @example let mquery = new MediaQueriesEvents( [
 *        "name" :        "mob",
 *        "query":        window.matchMedia( '(max-width:767px)' )
 *    },
 *    {
 *        "name" :        "tab",
 *        "query":        window.matchMedia( '(min-width:768px) and (max-width:959px)' )
 *    },
 *    {
 *        "name" :        "desk",
 *        "query":        window.matchMedia( '(min-width:960px)' )
 *    } ] );
 *
 * or
 *
 *  let mquery = new MediaQueriesEvents( [
 *        "name" :        "mob",
 *        "max":          767
 *    },
 *    {
 *        "name" :        "tab",
 *        "min":          768,
 *        "max":          956
 *    },
 *    {
 *        "name" :        "desk",
 *        "max":          960
 *    } ],
 *    {
 *       "unit": "px" // Default value
 *    }
 * );
 *
 * // Register a function to be call on mediaquery change
 * mquery.register( myFunction );
 *
 * // Remove a function to be called
 * mquery.remove( myFunction );
 *
 * // Refresh all registered function
 * mquery.refresh();
 *
 * // Call a function with the current breakpoint in parameters.
 * mquery.get( myFunction );
 *
 * // Return true if `breakpointName` is the name of the current breakpoint
 * boolean = mquery.is( 'desk' );
 *
 * // Current active breakpoint
 * myBreakpoint = mquery.currentBreakpoint; // => {name, query, ...} or false
 * myBreakpoint.is( 'mob' ); // => true|false
 * myBreakpoint.in( ['mob', 'tab'] ); // => true|false
 *
 * // List of all breakpoints
 * array = mquery.list;
 *
 * // Check if the current breakpoint is in a list.
 * boolean = mquery.in(['mob', 'tab']);
 *
 * // Pause mediaqueries watch
 * mquery.suspend();
 *
 * // Resume mediaqueries watch
 * mquery.resume();
 *
 * @param {Breakpoint[]} breakpointsList
 * @param {Object} [userOptions]
 * @param {String} [userOptions.unit="px"]
 */
export function MediaQueriesEvents(breakpointsList, userOptions) {
    let functionList, removeFromArray, isSuspended, currentBreakpoint;
    const defaultOptions = {
        "unit": "px"
    };
    const options = extend( {}, defaultOptions, userOptions );

    functionList = [];
    removeFromArray = slice;

    // TOOLS

    // Call each registered function
    function update( breakpoint, isMatching ) {
        if (!functionList.length) {
            return;
        }

        functionList.forEach( obj => {
            if (
                obj.type === MediaQueriesEvents.TYPE_ON_BOTH ||
                isMatching && obj.type === MediaQueriesEvents.TYPE_ON_ENTER ||
                !isMatching && obj.type === MediaQueriesEvents.TYPE_ON_LEAVE
            ) {
                obj.fcn(breakpoint)
            }
        } );
    }


    function getBreakpoint(breakpointName) {
        for (let i = 0, len = breakpointsList.length; i < len; ++i) {
            if (breakpointsList[i].name === breakpointName) {
                return breakpointsList[i];
            }
        }

        return false;
    }


    function getCurrentBreakpoint() {
        for (let i = 0, len = breakpointsList.length; i < len; ++i) {
            if (breakpointsList[i].query.matches) {
                return breakpointsList[i];
            }
        }

        return false;
    }


    function createQuery( breakpoint ) {
        let minQuery, maxQuery, query;

        if ( typeof breakpoint.min === 'number' ) {
            minQuery = `(min-width:${ breakpoint.min }${ options.unit })`;
        }

        if ( typeof breakpoint.max === 'number' ) {
            maxQuery = `(max-width:${ breakpoint.max }${ options.unit })`;
        }

        if ( minQuery && maxQuery ) {
            query = `${ minQuery } and ${ maxQuery }`;
        }
        else if ( minQuery ) {
            query = minQuery;
        }
        else if ( maxQuery ) {
            query = maxQuery;
        }
        else {
            throw `MEDIAQUERIES EVENTS: Need at least 'min' or 'max' property to create a breakpoint: ${ breakpoint.name }`;
        }

        return window.matchMedia( query );
    }


    // API

    /**
     * Register a function to be called on mediaquery change
     *
     * @param {MediaQueriesEvents_Handler} fcn - Function to call on mediaquery change
     * @param {String} [type=MediaQueriesEvents.TYPE_ON_ENTER] - Select when the function will be called: when entering the query, when leaving it, or on both
     */
    this.register = (fcn, type = MediaQueriesEvents.TYPE_ON_ENTER) => {
        functionList.push({
            fcn,
            type
        });
    }


    /**
     * Unregister a function
     *
     * @param {Function} fcn - Function to remove from the registered function list
     */
    this.remove = fcn => {
        let obj = functionList.find( o => o.fcn === fcn );

        removeFromArray(functionList, obj);

        return this;
    }


    /**
     * Force the refresh of all registered function
     */
    this.refresh = () => {
        update( getCurrentBreakpoint(), true );

        return this;
    }


    /**
     * Call a function with the current breakpoint
     *
     * @param {Function} fnc - Function to call
     */
    this.get = fnc => {
        if (fnc) {
            fnc(getCurrentBreakpoint());
        }

        return this;
    }


    /**
     * Check if we are in a specific range
     *
     * @param {string} breakpointName - Name of a breakpoint
     */
    this.is = breakpointName => {
        let breakpoint;

        breakpoint = getBreakpoint(breakpointName);

        return breakpoint ? breakpoint.query.matches : false;
    }


    /**
     * Return the currentbreakpointsList breakpoint
     *
     * @deprecated - Use mediaquerisEvent.currentBreakpoint instead
     *
     * @return {False|Breakpoint}
     */
    this.which = () => {
        return currentBreakpoint;
    }


    /**
     * Current active breakpoint
     *
     * @memberof MediaQueriesEvents
     * @member {False|Breakpoint} currentBreakpoint
     * @instance
     */
    Object.defineProperty( this, 'currentBreakpoint', {
        "get": () => currentBreakpoint
    } );


    /**
     * Check if the current breakpoint is in a list
     *
     * @param {string[]} breakpointNameList - Array of breakpoint name
     *
     * @return {boolean}
     */
    this.in = breakpointNameList => {
        let currentBreakpoint;

        if (!breakpointNameList || !breakpointNameList.length || !(currentBreakpoint = this.which())) {
            return false;
        }
        return breakpointNameList.includes(currentBreakpoint.name);
    }


    /**
     * Stop mediaqueries callback
     */
    this.suspend = () => {
        isSuspended = true;
    }


    /**
     * Active mediaqueries callback
     */
    this.resume = () => {
        isSuspended = false;
    }


    /**
     * List of all breakpoints
     *
     * @memberof MediaQueriesEvents
     * @member {Breakpoint[]} list
     * @instance
     */
    Object.defineProperty( this, 'list', {
        "get": () => breakpointsList
    } );


    // Handlers
    breakpointsList.forEach(breakpoint => {
        if ( !breakpoint.query ) {
            breakpoint.query = createQuery( breakpoint );
        }

        breakpoint.handler = mql => {
            if ( !isSuspended ) {
                update(breakpoint, mql.matches);
            }

            if ( mql.matches ) {
                currentBreakpoint = breakpoint;
            }
        }

        breakpoint.query.addListener(breakpoint.handler);

        breakpoint.in = breakpointNameList => {
                if (!breakpointNameList || !breakpointNameList.length) {
                return false;
            }
            return breakpointNameList.includes(breakpoint.name);
        }

        breakpoint.is = breakpointName => {
            return breakpoint.name === breakpointName;
        }
    });


    currentBreakpoint = getCurrentBreakpoint();
}

/**
 * Mediaquery entering callback type
 *
 * @memberof MediaQueriesEvents
 * @member {number} TYPE_ON_ENTER
 * @static
 * @readonly
 */
MediaQueriesEvents.TYPE_ON_ENTER = 0;
/**
 * Mediaquery leaving callback type
 *
 * @memberof MediaQueriesEvents
 * @member {number} TYPE_ON_LEAVE
 * @static
 * @readonly
 */
MediaQueriesEvents.TYPE_ON_LEAVE = 1;
/**
 * Mediaquery both callback type
 *
 * @memberof MediaQueriesEvents
 * @member {number} TYPE_ON_BOTH
 * @static
 * @readonly
 */
MediaQueriesEvents.TYPE_ON_BOTH  = 2;
