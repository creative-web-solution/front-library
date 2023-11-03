import { extend } from '@creative-web-solution/front-library/Helpers/extend';
import { slice } from '@creative-web-solution/front-library/Helpers/slice';

/**
 * @callback MediaQueriesEvents_Handler
 * @memberof MediaQueriesEvents
 * @param {Breakpoint} breakpoint
 * @param {Boolean} isMatching - True if we enter the query, false if we leave
 */
/**
 * @typedef Breakpoint
 * @memberof MediaQueriesEvents
 * @property {String} name
 * @property {Object} query - Object buid with the window.matchMedia() function
 * @property {Number} [min] - mediaquery lower bound
 * @property {Number} [max] - mediaquery upper bound
 * @property {Function} in - Return true if the breakpoint is in the list: breakpoint.in(['bp1', 'bp2'])
 * @property {Function} is - Return true if the name passed to the function is the name of the breakpoint: breakpoint.is('bp1')
 *
*/
/**
 * Manage media queries events
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
 * // Register a function to be call when leaving any breakpoint
 * mquery.register( callback, MediaQueriesEvents.TYPE_ON_LEAVE );
 *
 * // Remove a function to be called
 * mquery.remove( callback );
 *
 * // Bind a function to be call when entering the "small" breakpoint
 * mquery.on( callback, 'small' );
 * // Same as
 * mquery.on( callback, 'small', MediaQueriesEvents.TYPE_ON_ENTER );
 *
 * // Unbind the function
 * mquery.off( callback, 'small' );
 *
 * // Refresh all registered function for the current breakpoint
 * mquery.refresh();
 *
 * // Call a function with the current breakpoint in parameters.
 * mquery.get( callback );
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
 * // Pause media queries watch
 * mquery.suspend();
 *
 * // Resume media queries watch
 * mquery.resume();
 *
 * @param {Breakpoint[]} breakpointsList
 * @param {Object} [userOptions]
 * @param {String} [userOptions.unit="px"]
 */
export function MediaQueriesEvents( breakpointsList, userOptions ) {
    let removeFromArray, isSuspended, currentBreakpoint, functionHash;

    const DEFAULT_OPTIONS = {
        "unit": "px"
    };

    const GLOBAL_HASH_NAME = '__globalHashName';

    const OPTIONS = extend(
        {},
        DEFAULT_OPTIONS,
        userOptions
    );

    functionHash = {
        [ `${ GLOBAL_HASH_NAME }` ]: []
    };
    removeFromArray = slice;


    // TOOLS


    function processList( list, breakpoint, isMatching ) {
        list.forEach( obj => {
            if (
                obj.type === MediaQueriesEvents.TYPE_ON_BOTH ||
                isMatching && obj.type === MediaQueriesEvents.TYPE_ON_ENTER ||
                !isMatching && obj.type === MediaQueriesEvents.TYPE_ON_LEAVE
            ) {
                obj.callback( breakpoint, isMatching )
            }
        } );
    }


    // Call each registered function
    function update( breakpoint, isMatching ) {
        if ( functionHash[ breakpoint.name ] && functionHash[ breakpoint.name ].length ) {
            processList( functionHash[ breakpoint.name ], breakpoint, isMatching );
        }

        if ( functionHash[ GLOBAL_HASH_NAME ].length ) {
            processList( functionHash[ GLOBAL_HASH_NAME ], breakpoint, isMatching );
        }
    }


    function getBreakpoint( breakpointName ) {
        return breakpointsList.find( bp => bp.name === breakpointName );
    }


    function getCurrentBreakpoint() {
        return breakpointsList.find( bp => bp.query.matches );
    }


    function createQuery( breakpoint ) {
        let minQuery, maxQuery, query;

        if ( typeof breakpoint.min === 'number' ) {
            minQuery = `(min-width:${ breakpoint.min }${ OPTIONS.unit })`;
        }

        if ( typeof breakpoint.max === 'number' ) {
            maxQuery = `(max-width:${ breakpoint.max }${ OPTIONS.unit })`;
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
            throw `MEDIA QUERIES EVENTS: Need at least 'min' or 'max' property to create a breakpoint: ${ breakpoint.name }`;
        }

        return window.matchMedia( query );
    }


    // API

    /**
     * Return the value of the property with the name of the current breakpoint of an object
     *
     * @param {Object} obj
     *
     * @example mediaQueryEvent.getValue( { "small": "val1", "medium": "val2", ... } );
     * Ih the current breakpoint name is "small", it will return "val1"
     *
     * @returns {*}
     */
    this.getValue = ( obj ) => {
        return obj[ currentBreakpoint.name ];
    };


    /**
     * Bind a function to be called on a specific breakpoint
     *
     * @param {MediaQueriesEvents_Handler} callback - Callback
     * @param {String} breakpointName - Name of the breakpoint
     * @param {String} [type=MediaQueriesEvents.TYPE_ON_ENTER] - Select when the function will be called: when entering the query, when leaving it, or on both
     *
     * @returns {MediaQueriesEvents}
     */
    this.on = ( callback, breakpointName, type = MediaQueriesEvents.TYPE_ON_ENTER ) => {
        if ( !functionHash[ breakpointName ] ) {
            return this;
        }

        functionHash[ breakpointName ].push( {
            callback,
            type
        } );

        return this;
    }


    /**
     * Unbind a function to be called on a specific breakpoint
     *
     * @param {Function} callback - Function to remove from the registered function list
     * @param {String} breakpointName - Name of the breakpoint
     *
     * @returns {MediaQueriesEvents}
     */
    this.off = ( callback, breakpointName ) => {
        if ( !functionHash[ breakpointName ] ) {
            return this;
        }

        let obj = functionHash[ breakpointName ].find( o => o.callback === callback );

        removeFromArray(functionHash[ breakpointName ], obj);

        return this;
    }


    /**
     * Register a function to be called on all media queries change
     *
     * @param {MediaQueriesEvents_Handler} callback - Function to call on mediaquery change
     * @param {String} [type=MediaQueriesEvents.TYPE_ON_ENTER] - Select when the function will be called: when entering the query, when leaving it, or on both
     *
     * @returns {MediaQueriesEvents}
     */
    this.register = ( callback, type = MediaQueriesEvents.TYPE_ON_ENTER ) => {
        functionHash[ GLOBAL_HASH_NAME ].push({
            callback,
            type
        });

        return this;
    }


    /**
     * Unregister a function
     *
     * @param {Function} callback - Function to remove from the registered function list
     *
     * @returns {MediaQueriesEvents}
     */
    this.remove = callback => {
        let obj = functionHash[ GLOBAL_HASH_NAME ].find( o => o.callback === callback );

        removeFromArray( functionHash[ GLOBAL_HASH_NAME ], obj );

        return this;
    }


    /**
     * Force the refresh of all registered function
     *
     * @returns {MediaQueriesEvents}
     */
    this.refresh = () => {
        update( getCurrentBreakpoint(), true );

        return this;
    }


    /**
     * Call a function with the current breakpoint
     *
     * @param {Function} callback - Function to call
     *
     * @returns {MediaQueriesEvents}
     */
    this.get = callback => {
        if ( callback ) {
            callback( getCurrentBreakpoint() );
        }

        return this;
    }


    /**
     * Check if we are in a specific range
     *
     * @param {String} breakpointName - Name of a breakpoint
     *
     * @returns {Boolean}
     */
    this.is = breakpointName => {
        let breakpoint;

        breakpoint = getBreakpoint( breakpointName );

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
     * @readonly
     */
    Object.defineProperty( this, 'currentBreakpoint', {
        "get": () => currentBreakpoint
    } );


    /**
     * Check if the current breakpoint is in a list
     *
     * @param {String[]} breakpointNameList - Array of breakpoint name
     *
     * @return {Boolean}
     */
    this.in = breakpointNameList => {
        if ( !breakpointNameList || !breakpointNameList.length ) {
            return false;
        }
        return breakpointNameList.includes( currentBreakpoint.name );
    }


    /**
     * Stop media queries callback
     *
     * @returns {MediaQueriesEvents}
     */
    this.suspend = () => {
        isSuspended = true;

        return this;
    }


    /**
     * Active media queries callback
     *
     * @returns {MediaQueriesEvents}
     */
    this.resume = () => {
        isSuspended = false;

        return this;
    }


    /**
     * List of all breakpoints
     *
     * @memberof MediaQueriesEvents
     * @member {Breakpoint[]} list
     * @instance
     * @readonly
     */
    Object.defineProperty( this, 'list', {
        "get": () => breakpointsList
    } );


    // Handlers
    breakpointsList.forEach( breakpoint => {
        if ( !breakpoint.query ) {
            breakpoint.query = createQuery( breakpoint );
        }

        breakpoint.handler = mql => {
            if ( mql.matches ) {
                currentBreakpoint = breakpoint;
            }

            if ( !isSuspended ) {
                update( breakpoint, mql.matches );
            }
        };

        breakpoint.query.addListener( breakpoint.handler );

        breakpoint.in = breakpointNameList => {
            if ( !breakpointNameList || !breakpointNameList.length ) {
                return false;
            }
            return breakpointNameList.includes( breakpoint.name );
        };

        breakpoint.is = breakpointName => breakpoint.name === breakpointName;

        functionHash[ breakpoint.name ] = [];
    });


    currentBreakpoint = getCurrentBreakpoint();
}

/**
 * Mediaquery entering callback type
 *
 * @memberof MediaQueriesEvents
 * @member {Number} TYPE_ON_ENTER
 * @static
 * @readonly
 */
MediaQueriesEvents.TYPE_ON_ENTER = 0;
/**
 * Mediaquery leaving callback type
 *
 * @memberof MediaQueriesEvents
 * @member {Number} TYPE_ON_LEAVE
 * @static
 * @readonly
 */
MediaQueriesEvents.TYPE_ON_LEAVE = 1;
/**
 * Mediaquery both callback type
 *
 * @memberof MediaQueriesEvents
 * @member {Number} TYPE_ON_BOTH
 * @static
 * @readonly
 */
MediaQueriesEvents.TYPE_ON_BOTH  = 2;
