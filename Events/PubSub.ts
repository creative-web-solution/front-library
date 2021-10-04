import { on, off, fire } from './EventsManager';
import { isString }      from '../Helpers/Type';


interface PubSub {
    [ key: string ]: any;
}


/**
 * Publish / Suscribe event system
 *
 * @example
 * ```ts
 * pubSub.add([ "MY_EVENT_1", "MY_EVENT_2" ]);
 * pubSub.add( "MY_EVENT_3" );
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
 * pubSub.fire( pubSub.MY_EVENT_2, { "myProp": "test" } );
 * ```
*/
class PubSub {
    #EVENTS_STORE = {};


    /**
     * Add events name
     *
     * @param eventsNames - [ "name1", "name2" ] or "name1"
     */
    add( eventsNames: string | string[] ): this {

        if ( isString( eventsNames ) ) {
            this[ eventsNames as string ] = eventsNames;

            return this;
        }

        (eventsNames as string[] ).forEach( key => {
            this[ key ] = key;
        } );

        return this;
    }


    /**
     * Fire an event
     *
     * @param data - Data to be send to the callback functions
     */
    fire( eventName: string, data? ): this {
        fire( this.#EVENTS_STORE, {
            "eventsName": eventName,
            "detail":     data
        } );

        return this;
    }


    /**
     * Bind an event
     *
     * @param callback - (data) =&gt; `{}`
     */
    on( eventName: string, callback: FLib.Events.PubSub.Callback ): this {
        on( this.#EVENTS_STORE, {
            "eventsName": eventName,
            "callback":   callback
        } );

        return this;
    }


    /**
     * Unbind an event
     */
    off( eventName: string, callback: FLib.Events.PubSub.Callback  ): this {
        off( this.#EVENTS_STORE, {
            "eventsName": eventName,
            "callback":   callback
        } );

        return this;
    }
}

const pubSub = new PubSub();

export default pubSub;
