import { slice } from 'front-library/helpers/slice';

/**
 * @typedef {GlobalState_callback} KeyboardHandler_Options
 * @memberof globalState
 * @property {*} value
 * @property {string} properyName
 * @property {string} storeName
 */

/*
 *  Global State Manager
 */
function GlobalState() {
    let stores, dispatchEvents, _alwaysDispatch;

    const DEFAULT_STORE_NAME = 'DEFAULT';

    // Store callback to be called on ALL changes
    const GLOBAL_EVENTS_STORE = [];

    // Store callback to be called on SPECIFIC changes
    const EVENTS_STORE = {
        [DEFAULT_STORE_NAME]: {
            functions: [],
            props: {}
        }
    };
    stores = {};

    /**
     * Name of the default store
     *
     * @memberof globalState
     * @member DEFAULT_STORE_NAME
     * @type {string}
     */
    Object.defineProperty(this, 'DEFAULT_STORE_NAME', {
        get: function() {
            return DEFAULT_STORE_NAME;
        }
    });


    function dispatch(value, property, store) {

        if (!EVENTS_STORE[store]) {
            EVENTS_STORE[store] = {
                functions: [],
                props: {}
            };
        }

        if (!EVENTS_STORE[store].props[property]) {
            EVENTS_STORE[store].props[property] = [];
        }

        GLOBAL_EVENTS_STORE.forEach( fnc => {
            fnc(value, property, store);
        } );

        EVENTS_STORE[store].functions.forEach( fnc => {
            fnc(value, property, store);
        } );

        EVENTS_STORE[store].props[property].forEach( fnc => {
            fnc(value, property, store);
        } );
    }

    /**
     * Active the dispatch of events when a property is change
     *
     * @memberof globalState
     * @function activeEventsDispatch
     *
     * @param {Boolean} alwaysDispatch - If true, it will dispatch events even if the value in the store is the same as the value you try to set
     */
    this.activeEventsDispatch = function(alwaysDispatch) {
        dispatchEvents = true;
        _alwaysDispatch = alwaysDispatch;
    }

    /**
     * Stop the dispatch of events
     *
     * @memberof globalState
     * @function stopEventsDispatch
     */
    this.stopEventsDispatch = function() {
        dispatchEvents = false;
    }

    /**
     * Set a value in a property. If there are only 2 arguments, the default store will be used
     *
     * @memberof globalState
     * @function set
     * @param {string} arg1 - Store ( or Property if 2 arguments are passed )
     * @param {*} arg2 - Property ( or Value if 2 arguments are passed )
     * @param {*} value - Value if 3 arguments are passed
     *
     * @returns {*} - Return the setted value
     */
    this.set = (...args) => {
        let store, property, value, length, previousValue;

        length = args.length;

        if (length >= 3) {
            store = args[0];
            property = args[1];
            value = args[2];
        } else if (length === 2) {
            store = DEFAULT_STORE_NAME;
            property = args[0];
            value = args[1];
        } else {
            return
        }

        if (!stores[store]) {
            stores[store] = {};
        }

        previousValue = stores[store][property];

        stores[store][property] = value;

        if (dispatchEvents && (_alwaysDispatch || !_alwaysDispatch && previousValue !== value)) {
            dispatch(value, property, store);
        }

        return value;
    }


    /**
     * Get the value of a property. If there are only 2 arguments, the default store will be used.
     *
     * @memberof globalState
     * @function get
     * @param {string} arg1 - Store ( or Property if 1 arguments are passed )
     * @param {string} arg2 - Property if 2 arguments are passed
     *
     * @returns {*}
     */
    this.get = (...args) => {
        let store, property, length;

        length = args.length;

        if (length >= 2) {
            store = args[0];
            property = args[1];
        } else if (length === 1) {
            store = DEFAULT_STORE_NAME;
            property = args[0];
        } else {
            return;
        }

        return stores[store] ? stores[store][property] : undefined;
    }


    /**
     * Bind a function to be called on all properties change
     *
     * @memberof globalState
     * @function registerOnEveryChange
     * @param {GlobalState_callback} func
     */
    this.registerOnEveryChange = (func) => {
        if (!func) {
            return;
        }
        GLOBAL_EVENTS_STORE.push(func);
    }


    /**
     * Bind a function to be called on all properties change for a specific store
     *
     * @memberof globalState
     * @function registerOnStoreChange
     * @param {GlobalState_callback} func
     * @param {string} storeName
     */
    this.registerOnStoreChange = (func, storeName) => {
        if (!func || !storeName) {
            return;
        }

        if (!EVENTS_STORE[storeName]) {
            EVENTS_STORE[storeName] = {
                functions: [],
                props: {}
            };
        }

        EVENTS_STORE[storeName].functions.push(func);
    }


    /**
     * Bind a function to be called on a specific property change in a specific store
     *
     * @memberof globalState
     * @function registerOnPropertyChange
     * @param {GlobalState_callback} func
     * @param {string} storeName
     * @param {string} propertyName
     */
    this.registerOnPropertyChange = (func, storeName, propertyName) => {
        if (!func || !storeName || !propertyName) {
            return;
        }
        if (!EVENTS_STORE[storeName]) {
            EVENTS_STORE[storeName] = {
                functions: [],
                props: {}
            };
        }

        if (!EVENTS_STORE[storeName].props[propertyName]) {
            EVENTS_STORE[storeName].props[propertyName] = [];
        }

        EVENTS_STORE[storeName].props[propertyName].push(func);
    }


    /**
     * Unbind the registered function from all change events
     *
     * @memberof globalState
     * @function remove
     * @param {Function} func
     */
    this.remove = (func) => {
        if (!func) {
            return;
        }

        slice(GLOBAL_EVENTS_STORE, func);

        Object.keys(EVENTS_STORE).forEach(storeName => {
            slice(EVENTS_STORE[storeName].functions, func);
            Object.keys(EVENTS_STORE[storeName].props).forEach(propertyName => {
                slice(EVENTS_STORE[storeName].props[propertyName], func);
            });
        });
    }
}

/**
 * Manage a global object that allow storing and sharing values among modules.
 *
 * @namespace globalState
 *
 * @example // Use the default storage
 * globalState.set( 'PROP', 'VALUE' );
 * globalState.get( 'PROP' );
 *
 * // Use a storage with a specific name
 * globalState.set( 'MY_STORE', 'PROP', 'VALUE' );
 * globalState.get( 'MY_STORE', 'PROP' );
 *
 * // To use events on properties change
 * globalState.activeEventsDispatch();
 * globalState.registerOnEveryChange( (value, propertyName, storeName) => {} )
 * globalState.registerOnStoreChange( (value, propertyName, storeName) => {}, 'storeName' )
 * globalState.registerOnPropertyChange( (value, propertyName, storeName) => {}, 'storeName', 'myProperty' )
 */
let globalState = new GlobalState()

export { globalState }
