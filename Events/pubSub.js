import { on, off, fire } from 'front-library/Events/EventsManager';


function PubSub() {
    const EVENTS_STORE = {}

    /**
     * Initialize all events name
     *
     * @memberof pubSub
     * @function init
     * @param {Object} eventsNames
     *
     * @returns {PubSub}
     */
    this.init = eventsNames => {
        for ( let key in eventsNames ) {
            if ( !Object.prototype.hasOwnProperty.call( eventsNames, key) || this[ key ] ) {
                return;
            }

            this[ key ] = eventsNames[ key ];
        }

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
        fire(EVENTS_STORE, {
            "eventsName": eventName,
            "detail": data
        });

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
    this.on = (eventName, callback) => {
        on( EVENTS_STORE, {
            "eventsName": eventName,
            "callback": callback
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
    this.off = (eventName, callback) => {
        off( EVENTS_STORE, {
            "eventsName": eventName,
            "callback": callback
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
let pubSub = new PubSub();


export { pubSub };
