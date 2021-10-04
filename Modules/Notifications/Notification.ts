import { strToDOM }       from '../../DOM/StrToDOM';
import { aClass }         from '../../DOM/Class';
import { append, remove } from '../../DOM/Manipulation';
import { one, off }       from '../../Events/EventsManager';
import { wait }           from '../../Helpers/Wait';


/**
 * This is one notification
 */
export default class Notification {
    #$notification:       HTMLElement | undefined;
    #html:                string | undefined;
    #type:                string;
    #autoCloseTimeout:    number | undefined;
    #closeDelay:          boolean | number;
    #options:             FLib.Notifications.Options;
    #notificationOptions: FLib.Notifications.NotificationOptions;
    #close:               ( notification: Notification ) => void;


    constructor( htmlOrHTMLElement: string | HTMLElement, type: string, userOptions: FLib.Notifications.Options, close: ( notification: Notification ) => void, notificationOptions?: FLib.Notifications.NotificationOptions ) {

        this.#options             = userOptions;
        this.#closeDelay          = false;
        this.#type                = type;
        this.#notificationOptions = notificationOptions || {};
        this.#close               = close;

        if ( !notificationOptions ) {
            this.#closeDelay = this.#options.autoCloseDelay;
        }
        else if ( notificationOptions && notificationOptions.closeDelay !== false ) {
            this.#closeDelay = notificationOptions.closeDelay || this.#options.autoCloseDelay;
        }

        if ( typeof htmlOrHTMLElement === 'string' ) {
            this.#html = htmlOrHTMLElement;
        }
        else {
            this.#$notification = htmlOrHTMLElement;
        }
    }


    #onClick = ( e: Event ): void => {
        clearTimeout( this.#autoCloseTimeout );

        this.#options.onClick?.( this );
        this.#notificationOptions?.onClick?.call( this, e );

        this.#close( this );
    }


    show( $list: HTMLElement ): Promise<any> {
        if ( !this.#$notification ) {
            this.#$notification = strToDOM( this.#options.templates.notification ) as HTMLElement;
            ( this.#$notification as HTMLElement ).innerHTML = this.#html || '';

            if ( this.#options.cssClass[ this.#type ] ) {
                aClass( this.#$notification, this.#options.cssClass[ this.#type ] );
            }

            append( this.#$notification, $list );
        }

        one( this.#$notification, {
            "eventsName":   "click",
            "callback":     this.#onClick
        } );

        if ( this.#closeDelay ) {
            this.#autoCloseTimeout = setTimeout( () => {
                this.#close( this );
            }, this.#closeDelay as number * 1000 );
        }

        return wait( 100 ).then( () => this.#options.animations.show( this.#$notification, this.#options ) );
    }


    hide(): Promise<any> {
        if ( !this.#$notification ) {
            return Promise.resolve()
        }

        off( this.#$notification, {
            "eventsName":   "click",
            "callback":     this.#onClick
        } );

        return this.#options.animations.hide( this.#$notification, this.#options ).then( () => {
            remove( ( this.#$notification as HTMLElement ) );
        } );
    }
}
