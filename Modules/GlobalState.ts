import { slice } from '@creative-web-solution/front-library/Helpers/Slice';
import { extend } from '../Helpers/Extend';



const DEFAULT_OPTIONS: GlobalStateOptionsType = {
    "dispatchEvents": false,
    "alwaysDispatch": false
}


/*
 *  Global State Manager
 */
class GlobalState {

    #DEFAULT_STORE_NAME  = 'DEFAULT';

    #EVENTS_STORE: {
        [ storeName: string ]: {
            functions: GlobalStateCallbackType[],
            props: {
                [ propertyName: string ]: GlobalStateCallbackType[]
            }
        }
    };
    #GLOBAL_EVENTS_STORE: GlobalStateCallbackType[] = [];
    #stores              = {};
    #alwaysDispatch: boolean;
    #dispatchEvents: boolean;


    get DEFAULT_STORE_NAME() {
        return this.#DEFAULT_STORE_NAME;
    }


    constructor( userOptions?: GlobalStateOptionsType ) {
        const options = extend( {}, DEFAULT_OPTIONS, userOptions );

        this.#alwaysDispatch      = options.alwaysDispatch;
        this.#dispatchEvents      = options.dispatchEvents;

        // Store callback to be called on ALL changes
        this.#GLOBAL_EVENTS_STORE = [];

        // Store callback to be called on SPECIFIC changes
        this.#EVENTS_STORE = {
            [ this.#DEFAULT_STORE_NAME ]: {
                "functions": [],
                "props": {}
            }
        };
    }


    private dispatch( value, property: string, store: string ) {

        if ( !this.#EVENTS_STORE[ store ] ) {
            this.#EVENTS_STORE[ store ] = {
                "functions": [],
                "props":     {}
            };
        }

        if ( !this.#EVENTS_STORE[ store ].props[ property ] ) {
            this.#EVENTS_STORE[ store ].props[ property ] = [];
        }

        this.#GLOBAL_EVENTS_STORE.forEach( fnc => {
            fnc( value, property, store );
        } );

        this.#EVENTS_STORE[ store ].functions.forEach( fnc => {
            fnc( value, property, store );
        } );

        this.#EVENTS_STORE[ store ].props[ property ].forEach( fnc => {
            fnc( value, property, store );
        } );
    }


    /**
     * Active the dispatch of events when a property is change
     *
     * @param alwaysDispatch - If true, it will dispatch events even if the value in the store is the same as the value you try to set
     */
    activeEventsDispatch( alwaysDispatch: boolean = false ) {
        this.#dispatchEvents = true;
        this.#alwaysDispatch = alwaysDispatch;
    }


    /**
     * Stop the dispatch of events
     */
    stopEventsDispatch() {
        this.#dispatchEvents = false;
    }


    /**
     * Set a value in a property. If there are only 2 arguments, the default store will be used
     *
     * @param propertyName
     * @param value
     * @param storeName
     *
     * @returns Return the setted value
     */
    set( propertyName: string, value: any, storeName = this.#DEFAULT_STORE_NAME ): any {
        if ( !propertyName || !value ) {
            return
        }

        if ( !this.#stores[ storeName ] ) {
            this.#stores[ storeName ] = {};
        }

        const previousValue = this.#stores[ storeName ][ propertyName ];

        this.#stores[ storeName ][ propertyName]  = value;

        if ( this.#dispatchEvents && ( this.#alwaysDispatch || !this.#alwaysDispatch && previousValue !== value ) ) {
            this.dispatch( value, propertyName, storeName );
        }

        return value;
    }


    /**
     * Get the value of a property. If there are only 2 arguments, the default store will be used.
     *
     * @param propertyName
     * @param storeName
     */
    get( propertyName: string, storeName = this.#DEFAULT_STORE_NAME ): any {
        if ( !propertyName ) {
            return;
        }

        return this.#stores?.[ storeName ]?.[ propertyName ];
    }


    /**
     * Bind a function to be called on all properties change
     */
    registerOnEveryChange( callback: GlobalStateCallbackType ) {
        if ( !callback ) {
            return;
        }

        this.#GLOBAL_EVENTS_STORE.push( callback );
    }


    /**
     * Bind a function to be called on all properties change for a specific store
     */
    registerOnStoreChange( callback: GlobalStateCallbackType, storeName: string ) {
        if ( !callback || !storeName ) {
            return;
        }

        if ( !this.#EVENTS_STORE[ storeName ] ) {
            this.#EVENTS_STORE[ storeName ] = {
                "functions": [],
                "props": {}
            };
        }

        this.#EVENTS_STORE[ storeName ].functions.push( callback );
    }


    /**
     * Bind a function to be called on a specific property change in a specific store
     */
    registerOnPropertyChange( callback: GlobalStateCallbackType, storeName: string, propertyName: string ) {
        if ( !callback || !storeName || !propertyName ) {
            return;
        }
        if ( !this.#EVENTS_STORE[ storeName ] ) {
            this.#EVENTS_STORE[ storeName ] = {
                "functions": [],
                "props":     {}
            };
        }

        if ( !this.#EVENTS_STORE[ storeName ].props[ propertyName ] ) {
            this.#EVENTS_STORE[ storeName ].props[ propertyName ] = [];
        }

        this.#EVENTS_STORE[ storeName ].props[ propertyName ].push( callback );
    }


    /**
     * Unbind the registered function from all change events
     */
    remove( callback: GlobalStateCallbackType ) {
        if ( !callback ) {
            return;
        }

        slice( this.#GLOBAL_EVENTS_STORE, callback );

        Object.keys( this.#EVENTS_STORE ).forEach( storeName => {
            slice( this.#EVENTS_STORE[ storeName ].functions, callback );
            Object.keys( this.#EVENTS_STORE[ storeName ].props).forEach( propertyName => {
                slice( this.#EVENTS_STORE[ storeName ].props[ propertyName ], callback );
            } );
        } );
    }
}

/**
 * Manage a global object that allow storing and sharing values among modules.
 *
 * @example
 * // Use the default storage
 * const globalState = new GlobalState();
 * globalState.set( 'PROP', 'VALUE' );
 * globalState.get( 'PROP' );
 *
 * @example
 * // Use a storage with a specific name
 * const globalState = new GlobalState();
 * globalState.set( 'MY_STORE', 'PROP', 'VALUE' );
 * globalState.get( 'MY_STORE', 'PROP' );
 *
 * @example
 * // To use events on properties change
 * const globalState = new GlobalState({
 *  "dispatchEvents": true
 * });
 * globalState.registerOnEveryChange( (value, propertyName, storeName) => {} )
 * globalState.registerOnStoreChange( (value, propertyName, storeName) => {}, 'storeName' )
 * globalState.registerOnPropertyChange( (value, propertyName, storeName) => {}, 'storeName', 'myProperty' )
 */
export default GlobalState;
