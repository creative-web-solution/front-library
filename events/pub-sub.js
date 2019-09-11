import { on, off, fire } from 'front-library/events/event-manager';

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
let pubSub;

{
    function PubSub() {
        const EVENTS_STORE = {}

        /**
         * Initialize all events name
         *
         * @memberof pubSub
         * @param {object} eventsNames
         */
        this.init = eventsNames => {
            for (let key in eventsNames) {
                if (!Object.prototype.hasOwnProperty.call( eventsNames, key) || this[key]) {
                    return
                }

                this[key] = eventsNames[key]
            }
        }

        /**
         * Fire an event
         *
         * @memberof pubSub
         * @param {string} eventName
         * @param {object} [data] - Data to be send to the callback functions
         */
        this.fire = (eventName, data) => {
            fire(EVENTS_STORE, {
                "eventsName": eventName,
                "detail": data
            })
        }

        /**
         * Bind an event
         *
         * @memberof pubSub
         * @param {string} eventName
         * @param {Function} callback - (data) => {}
         */
        this.on = (eventName, callback) => {
            on(EVENTS_STORE, {
                "eventsName": eventName,
                "callback": callback
            })
        }

        /**
         * Unbind an event
         *
         * @memberof pubSub
         * @param {string} eventName
         * @param {Function} callback
         */
        this.off = (eventName, callback) => {
            off(EVENTS_STORE, {
                "eventsName": eventName,
                "callback": callback
            })
        }
    }

    pubSub = new PubSub()
}

export { pubSub }
