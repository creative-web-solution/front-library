import { extend } from '../Helpers/Extend';
import { slice }  from '../Helpers/Slice';


/**
 * Manage media queries events
 *
 * @example
 * let mquery = new MediaQueriesEvents( [
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
 */
export default class MediaQueriesEvents {

    #breakpointsList:   Breakpoint[];
    #currentBreakpoint: Breakpoint | undefined;
    #functionHash:      { [ key: string ]: MediaQueriesEventsInternalCallbackType[] };
    #isSuspended:       boolean = false;
    #options:           MediaQueriesEventsOptions;

    #globalHashName     = '__globalHashName';

    /** Current active breakpoint */
    get currentBreakpoint() {
        return this.#currentBreakpoint;
    }

    /** List of all breakpoints */
    get list() {
        return this.#breakpointsList;
    }


    constructor( breakpointsList: MediaQueriesEventsListOptions[], userOptions: MediaQueriesEventsOptions ) {
        const DEFAULT_OPTIONS = {
            "unit": "px"
        };

        this.#options = extend(
            {},
            DEFAULT_OPTIONS,
            userOptions
        );

        this.#functionHash = {
            [ `${ this.#globalHashName }` ]: []
        };

        // Handlers
        this.#breakpointsList = breakpointsList.map( breakpointItem => {
            const breakpoint: Breakpoint = {
                ...breakpointItem,
                "query": breakpointItem.query || this.createQuery( breakpointItem ),
                "handler": mql => {
                    if ( mql.matches ) {
                        this.#currentBreakpoint = breakpoint;
                    }

                    if ( !this.#isSuspended ) {
                        this.update( breakpoint, mql.matches );
                    }
                },
                "in": breakpointNameList => {
                    if ( !breakpointNameList || !breakpointNameList.length ) {
                        return false;
                    }
                    return breakpointNameList.includes( breakpoint.name );
                },
                "is": breakpointName => breakpoint.name === breakpointName
            };

            if ( breakpoint.query.addEventListener ) {
                breakpoint.query.addEventListener( "change", breakpoint.handler );
            }
            else {
                breakpoint.query.addListener( breakpoint.handler );
            }
            this.#functionHash[ breakpoint.name ] = [];

            return breakpoint;
        });

        this.#currentBreakpoint = this.getCurrentBreakpoint();
    }


    // TOOLS


    private processList( list, breakpoint, isMatching ) {
        list.forEach( obj => {
            if (
                obj.type === 'both' ||
                isMatching && obj.type === 'enter' ||
                !isMatching && obj.type === 'leave'
            ) {
                obj.callback( breakpoint, isMatching )
            }
        } );
    }


    // Call each registered function
    private update( breakpoint: Breakpoint, isMatching: boolean ): void {
        if ( this.#functionHash[ breakpoint.name ] && this.#functionHash[ breakpoint.name ].length ) {
            this.processList( this.#functionHash[ breakpoint.name ], breakpoint, isMatching );
        }

        if ( this.#functionHash[ this.#globalHashName ].length ) {
            this.processList( this.#functionHash[ this.#globalHashName ], breakpoint, isMatching );
        }
    }


    private getBreakpoint( breakpointName: string ): Breakpoint | undefined {
        return this.#breakpointsList.find( bp => bp.name === breakpointName );
    }


    private getCurrentBreakpoint(): Breakpoint | undefined {
        return this.#breakpointsList.find( bp => bp.query.matches );
    }


    private createQuery( breakpoint: MediaQueriesEventsListOptions ): MediaQueryList {
        let minQuery, maxQuery, query;

        if ( typeof breakpoint.min === 'number' ) {
            minQuery = `(min-width:${ breakpoint.min }${ this.#options.unit })`;
        }

        if ( typeof breakpoint.max === 'number' ) {
            maxQuery = `(max-width:${ breakpoint.max }${ this.#options.unit })`;
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
     * @param obj
     *
     * @example
     * mediaQueryEvent.getValue( { "small": "val1", "medium": "val2", ... } );
     * Ih the current breakpoint name is "small", it will return "val1"
     */
    getValue<Value>( obj: { [ key: string ]: Value } ): Value | undefined {
        if ( !this.#currentBreakpoint ) {
            return;
        }
        return obj[ this.#currentBreakpoint.name ];
    };


    /**
     * Bind a function to be called on a specific breakpoint
     *
     * @param callback - Callback
     * @param breakpointName - Name of the breakpoint
     * @param [type=MediaQueriesEvents.TYPE_ON_ENTER] - Select when the function will be called: when entering the query, when leaving it, or on both
    */
    on( callback: MediaQueriesEventsCallback, breakpointName: string, type: MediaQueriesEventsCallbackType = 'enter' ): this {
        if ( !this.#functionHash[ breakpointName ] ) {
            return this;
        }

        this.#functionHash[ breakpointName ].push( {
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
    */
    off( callback: MediaQueriesEventsCallback, breakpointName: string ): this {
        if ( !this.#functionHash[ breakpointName ] ) {
            return this;
        }

        let obj = this.#functionHash[ breakpointName ].find( o => o.callback === callback );

        slice( this.#functionHash[ breakpointName ], obj );

        return this;
    }


    /**
     * Register a function to be called on all media queries change
     *
     * @param {MediaQueriesEvents_Handler} callback - Function to call on mediaquery change
     * @param {String} [type=MediaQueriesEvents.TYPE_ON_ENTER] - Select when the function will be called: when entering the query, when leaving it, or on both
    */
    register( callback: MediaQueriesEventsCallback, type: MediaQueriesEventsCallbackType = 'enter' ): this {
        this.#functionHash[ this.#globalHashName ].push({
            callback,
            type
        });

        return this;
    }


    /**
     * Unregister a function
     *
     * @param callback - Function to remove from the registered function list
    */
    remove( callback: MediaQueriesEventsCallback ): this {
        let obj = this.#functionHash[ this.#globalHashName ].find( o => o.callback === callback );

        slice( this.#functionHash[ this.#globalHashName ], obj );

        return this;
    }


    /**
     * Force the refresh of all registered function
    */
    refresh(): this {
        if ( !this.#currentBreakpoint ) {
            return this;
        }

        this.update( this.#currentBreakpoint, this.#currentBreakpoint.query.matches );

        return this;
    }


    /**
     * Call a function with the current breakpoint
     *
     * @param callback - Function to call
     */
    get( callback: MediaQueriesEventsCallback ): this {
        if ( !this.#currentBreakpoint || !callback ) {
            return this;
        }

        callback( this.#currentBreakpoint, this.#currentBreakpoint.query.matches );

        return this;
    }


    /**
     * Check if we are in a specific range
     *
     * @param breakpointName - Name of a breakpoint
     */
    is( breakpointName: string ): boolean {
        let breakpoint;

        breakpoint = this.getBreakpoint( breakpointName );

        return breakpoint ? breakpoint.query.matches : false;
    }


    /**
     * Check if the current breakpoint is in a list
     *
     * @param breakpointNameList - Array of breakpoint name
     */
    in( breakpointNameList: string[] ): boolean {
        if ( !this.#currentBreakpoint || !breakpointNameList || !breakpointNameList.length ) {
            return false;
        }
        return breakpointNameList.includes( this.#currentBreakpoint.name );
    }


    /**
      * Stop media queries callback
     */
    suspend(): this {
        this.#isSuspended = true;

        return this;
    }


    /**
     * Active media queries callback
     */
    resume(): this {
        this.#isSuspended = false;

        return this;
    }
}
