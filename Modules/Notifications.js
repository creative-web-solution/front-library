import { extend } from "@creative-web-solution/front-library/Helpers/Extend";
import { strToDOM } from "@creative-web-solution/front-library/DOM/strToDOM";
import { slice } from "@creative-web-solution/front-library/Helpers/slice";
import { aClass, rClass } from "@creative-web-solution/front-library/DOM/Class";
import { append, remove } from "@creative-web-solution/front-library/DOM/Manipulation";
import { one, off } from "@creative-web-solution/front-library/Events/EventsManager";
import { wait } from "@creative-web-solution/front-library/Helpers/wait";
import { onTransitionEnd } from "@creative-web-solution/front-library/Events/onTransitionEnd";


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
 * This is one notification
 * @class
 * @ignore
 *
 * @param {String|HTMLElement} html
 * @param {String} type
 * @param {Object} options
 * @param {Function} close
 * @param {Object} notificationOptions
 */
function Notification( htmlOrHTMLElement, type, options, close, notificationOptions ) {
    let $notification, html, autoCloseTimeout, closeDelay;

    const SELF = this;
    closeDelay = false;

    if ( !notificationOptions ) {
        closeDelay = options.autoCloseDelay;
    }
    else if ( notificationOptions && notificationOptions.closeDelay !== false ) {
        closeDelay = notificationOptions.closeDelay || options.autoCloseDelay;
    }

    if ( htmlOrHTMLElement instanceof HTMLElement ) {
        $notification = htmlOrHTMLElement;
    }
    else {
        html = htmlOrHTMLElement;
    }


    function onClick( e ) {
        clearTimeout( autoCloseTimeout );

        options.onClick && options.onClick.call( this, e );
        notificationOptions && notificationOptions.onClick && notificationOptions.onClick.call( this, e );

        close( SELF );
    }


    this.show = ( $list ) => {
        if ( !$notification ) {
            $notification = strToDOM( options.templates.notification );
            $notification.innerHTML = html;

            if ( options.cssClass[ type ] ) {
                aClass( $notification, options.cssClass[ type ] );
            }

            append( $notification, $list );
        }

        one( $notification, {
            "eventsName":   "click",
            "callback":     onClick
        } );

        if ( closeDelay ) {
            autoCloseTimeout = setTimeout( () => {
                close( SELF );
            }, closeDelay * 1000 );
        }

        return wait( 100 ).then( () => options.animations.show( $notification, options ) );
    };



    this.hide = () => {
        off( $notification, {
            "eventsName":   "click",
            "callback":     onClick
        } );

        return options.animations.hide( $notification, options ).then( () => {
            remove( $notification );
        } );
    };
}

/**
 * Manages a list of notifications
 * @class
 *
 * @example let notifSys = new Notification();
 * notifSys.add( 'Here is a simple notification' );
 *
 * @param {Object} [userOptions]
 * @param {HTMLElement} [userOptions.$wrapper=document.body]
 * @param {Function} [userOptions.onClick]
 * @param {Number} [userOptions.autoCloseDelay=5] In second
 * @param {Object} [userOptions.templates]
 * @param {String} [userOptions.templates.notifications=<div class="notifications"><div class="list"></div></div>]
 * @param {String} [userOptions.templates.notification=<div class="notification"></div>]
 * @param {Object} [userOptions.selectors]
 * @param {String} [userOptions.selectors.notifications=.notifications]
 * @param {String} [userOptions.selectors.list=.list]
 * @param {String} [userOptions.selectors.notification=.notification]
 * @param {Object} [userOptions.cssClass]
 * @param {String} [userOptions.cssClass.open=open]
 * @param {String} [userOptions.cssClass.success=success]
 * @param {String} [userOptions.cssClass.danger=danger]
 * @param {String} [userOptions.cssClass.warning=warning]
 * @param {String} [userOptions.cssClass.info=info]
 * @param {Object} [userOptions.animations]
 * @param {Function} [userOptions.animations.show] - ($notification, options) => Promise
 * @param {Function} [userOptions.animations.hide] - ($notification, options) => Promise
 */
export function Notifications( userOptions = {} ) {
    let options, $list, $notifications, notificationsList;

    options             = extend( DEFAULT_OPTIONS, userOptions );
    notificationsList   = [];

    $notifications      = document.querySelector( options.selectors.notifications );

    if ( !$notifications ) {
        $notifications = strToDOM( options.templates.notifications );
        append( $notifications, options.$wrapper );
    }


    $list = $notifications.querySelector( options.selectors.list );


    $list.querySelectorAll( options.selectors.notification ).forEach( $notification => {
        insertNotification( $notification, null );
    } );


    function insertNotification( htmlOrHTMLElement, type = Notifications.INFO, notificationOptions ) {
        let notification = new Notification( htmlOrHTMLElement, type, options, close, notificationOptions );
        notification.show( $list );

        if ( !notificationsList.length ) {
            aClass( $notifications, 'open' );
        }

        notificationsList.push( notification );
    }


    function close( notification ) {
        notification.hide().then( () => {
            notificationsList = slice( notificationsList, notification );

            if ( !notificationsList.length ) {
                rClass( $notifications, 'open' );
            }
        } );
    }


    /**
     * Add a new notification.
     *
     * @param {String} html
     * @param {String} type
     * @param {Object} [notificationOptions]
     * @param {Number|false} [notificationOptions.closeDelay] - In second or False
     * @param {Function} [notificationOptions.onClick]
     */
    this.add = ( html, type, notificationOptions ) => {
        insertNotification( html, type, notificationOptions );
    };


    /**
     * Add a new information notification.
     *
     * @param {String} html
     * @param {Object} [notificationOptions]
     * @param {Number|false} [notificationOptions.closeDelay] - In second or False
     * @param {Function} [notificationOptions.onClick]
     */
    this.addInfo = ( html, notificationOptions ) => {
        insertNotification( html, Notifications.INFO, notificationOptions );
    };


    /**
     * Add a new success notification.
     *
     * @param {String} html
     * @param {Object} [notificationOptions]
     * @param {Number|false} [notificationOptions.closeDelay] - In second or False
     * @param {Function} [notificationOptions.onClick]
     */
    this.addSuccess = ( html, notificationOptions ) => {
        insertNotification( html, Notifications.SUCCESS, notificationOptions );
    };


    /**
     * Add a new warning notification.
     *
     * @param {String} html
     * @param {Object} [notificationOptions]
     * @param {Number|false} [notificationOptions.closeDelay] - In second or False
     * @param {Function} [notificationOptions.onClick]
     */
    this.addWarning = ( html, notificationOptions ) => {
        insertNotification( html, Notifications.WARNING, notificationOptions );
    };


    /**
     * Add a new error/danger notification.
     *
     * @param {String} html
     * @param {Object} [notificationOptions]
     * @param {Number|false} [notificationOptions.closeDelay] - In second or False
     * @param {Function} [notificationOptions.onClick]
     */
    this.addDanger = ( html, notificationOptions ) => {
        insertNotification( html, Notifications.DANGER, notificationOptions );
    };


    /**
     * Close all notifications
     */
    this.closeAll = () => {
        return Promise.all( notificationsList.map( notification => notification.hide() ) );
    };


    /**
     * Close all notifications and remove all containers
     */
    this.clean = () => {
        return this.closeAll()
                .then( () => remove( $notifications ) );
    };
}


/**
 * Notification information type
 *
 * @memberof Notifications
 * @member {String} INFO
 * @static
 * @readonly
 */
Notifications.INFO = 'info';


/**
 * Notification success type
 *
 * @memberof Notifications
 * @member {String} SUCCESS
 * @static
 * @readonly
 */
Notifications.SUCCESS = 'success';


/**
 * Notification warning type
 *
 * @memberof Notifications
 * @member {String} WARNING
 * @static
 * @readonly
 */
Notifications.WARNING = 'warning';


/**
 * Notification error/danger type
 *
 * @memberof Notifications
 * @member {String} ERROR
 * @static
 * @readonly
 */
Notifications.DANGER = 'danger';
