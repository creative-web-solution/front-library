import { on, off, fire } from '@creative-web-solution/front-library/Events/EventsManager';
import { isString } from '@creative-web-solution/front-library/Helpers/Type';


function PubSub() {
    const EVENTS_STORE = {};

    /**
     * Add events name
     *
     * @memberof pubSub
     * @function add
     * @param {Object|String} eventsNames - [ "name1", "name2" ] or "name1"
     *
     * @returns {PubSub}
     */
    this.add = eventsNames => {

        if ( isString( eventsNames ) ) {
            this[ eventsNames ] = eventsNames;

            return this;
        }

        eventsNames.forEach( key => {
            this[ key ] = key;
        } );

        return this;
    }


    /**
     * Initialize all events name
     *
     * @memberof pubSub
     * @function init
     * @param {Object} eventsNames - { "name1": val, "name2": val2, ... }
     *
     * @deprecated Use pubSub.add( [] ) instead
     *
     * @returns {PubSub}
     */
    this.init = eventsNames => {
        Object.keys( eventsNames ).forEach( key => {
            if ( this[ key ] ) {
                return;
            }
            this[ key ] = eventsNames[ key ];
        } );

        return this;
    }


    /**
     * Fire an event
     *
     * @memberof pubSub
     * @function fire
     * @param {String} eventName
     * @param {Object} [data] - Data to be send to the callback functions
     *
     * @returns {PubSub}
     */
    this.fire = ( eventName, data ) => {
        fire( EVENTS_STORE, {
            "eventsName": eventName,
            "detail":     data
        } );

        return this;
    }


    /**
     * Bind an event
     *
     * @memberof pubSub
     * @function on
     * @param {String} eventName
     * @param {Function} callback - (data) => {}
     *
     * @returns {PubSub}
     */
    this.on = ( eventName, callback ) => {
        on( EVENTS_STORE, {
            "eventsName": eventName,
            "callback":   callback
        } );

        return this;
    }


    /**
     * Unbind an event
     *
     * @memberof pubSub
     * @function off
     * @param {String} eventName
     * @param {Function} callback
     *
     * @returns {PubSub}
     */
    this.off = ( eventName, callback ) => {
        off( EVENTS_STORE, {
            "eventsName": eventName,
            "callback":   callback
        } );

        return this;
    }
}


/**
 * Publish / Suscribe event system
 * @namespace pubSub
 *
 * @example pubSub.init(
 *     {
 *         "MY_EVENT_1": "myevent1",
 *         "MY_EVENT_2": "myevent2"
 *     }
 * );
 *
 *
 * pubSub.on( pubSub.MY_EVENT_1, callback );
 * pubSub.off( pubSub.MY_EVENT_1, callback );
 * pubSub.fire( pubSub.MY_EVENT_1 );
 *
 * // You can send data along with the event:
 * pubSub.on( pubSub.MY_EVENT_2, data => {
 *      console.log(data.myProp)
 * } );
 *
 * pubSub.fire( pubSub.MY_EVENT_2, {myProp: 'test'} );
*/
const pubSub = new PubSub();


export { pubSub };
