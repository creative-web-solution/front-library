import { extend }         from '../../Helpers/Extend';
import { strToDOM }       from '../../DOM/StrToDOM';
import { slice }          from '../../Helpers/Slice';
import { aClass, rClass } from '../../DOM/Class';
import { append, remove } from '../../DOM/Manipulation';
import { wait }           from '../../Helpers/Wait';
import onTransitionEnd    from '../../Events/OnTransitionEnd';
import Notification       from './Notification';


const DEFAULT_OPTIONS = {
    "$wrapper": document.body,
    "autoCloseDelay": "5", // s
    "templates": {
        "notifications": "<div class=\"notifications\"><div class=\"list\"></div></div>",
        "notification": "<div class=\"notification\"></div>"
    },
    "selectors": {
        "notifications":    ".notifications",
        "list":             ".list",
        "notification":     ".notification"
    },
    "cssClass": {
        "open":         "open",
        "success":      "success",
        "danger":       "danger",
        "warning":      "warning",
        "info":         "info"
    },
    "animations": {
        "show": ( $notification, options ) => {
            aClass( $notification, options.cssClass.open );

            return Promise.resolve();
        },
        "hide": ( $notification, options ) => {
            let prom = onTransitionEnd( $notification );

            wait().then( () => rClass( $notification, options.cssClass.open ) );

            return prom;
        }
    }
};


/**
 * Manages a list of notifications
 * @class
 *
 * @example let notifSys = new Notification();
 * notifSys.add( 'Here is a simple notification' );
 *
 * @param {Object} [userOptions]
 */
export default class Notifications {

    #options: NotificationsOptionsType;
    #$list: HTMLElement;
    #$notifications: HTMLElement;
    #notificationsList: Notification[];


    constructor( userOptions: NotificationsOptionsType ) {

        this.#options             = extend( {}, DEFAULT_OPTIONS, userOptions );
        this.#notificationsList   = [];

        this.#$notifications      = document.querySelector( this.#options.selectors!.notifications! )!;

        if ( !this.#$notifications ) {
            this.#$notifications = strToDOM( this.#options.templates!.notifications ) as HTMLElement;
            append( this.#$notifications, this.#options.$wrapper! );
        }


        this.#$list = this.#$notifications.querySelector( this.#options.selectors!.list! ) as HTMLElement;


        this.#$list.querySelectorAll( this.#options.selectors!.notification! ).forEach( $notification => {
            this.insertNotification( $notification as HTMLElement );
        } );
    }


    private insertNotification( htmlOrHTMLElement: string | HTMLElement, type: NotificationType = 'info', notificationOptions?: NotificationOptionsType ) {
        let notification = new Notification( htmlOrHTMLElement, type, this.#options, this.close.bind( this ), notificationOptions );
        notification.show( this.#$list );

        if ( !this.#notificationsList.length ) {
            aClass( this.#$notifications, 'open' );
        }

        this.#notificationsList.push( notification );
    }


    private close( notification: Notification ) {
        notification.hide().then( () => {
            this.#notificationsList = slice( this.#notificationsList, notification );

            if ( !this.#notificationsList.length ) {
                rClass( this.#$notifications, 'open' );
            }
        } );
    }


    /**
     * Add a new notification.
     */
    add( html: string, type?: NotificationType, notificationOptions?: NotificationOptionsType ) {
        this.insertNotification( html, type, notificationOptions );
    };


    /**
     * Add a new information notification.
     */
    addInfo( html: string, notificationOptions?: NotificationOptionsType ) {
        this.insertNotification( html, 'info', notificationOptions );
    };


    /**
     * Add a new success notification.
     */
    addSuccess( html: string, notificationOptions?: NotificationOptionsType ) {
        this.insertNotification( html, 'success', notificationOptions );
    };


    /**
     * Add a new warning notification.
     */
    addWarning( html: string, notificationOptions?: NotificationOptionsType ) {
        this.insertNotification( html, 'warning', notificationOptions );
    };


    /**
     * Add a new error/danger notification.
     */
    addDanger( html: string, notificationOptions?: NotificationOptionsType ) {
        this.insertNotification( html, 'danger', notificationOptions );
    };


    /**
     * Close all notifications
     */
    closeAll() {
        return Promise.all( this.#notificationsList.map( notification => notification.hide() ) );
    };


    /**
     * Close all notifications and remove all containers
     */
    clean() {
        return this.closeAll()
                .then( () => remove( this.#$notifications ) );
    };
}
