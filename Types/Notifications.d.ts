declare namespace FLib {
    namespace Notifications {
        type Type =  'info' | 'success' | 'warning' | 'danger';

        type Options = {
            /** @defaultValue document.body */
            $wrapper: HTMLElement;
            onClick:  ( notification ) => void;
            /**
             * In second
             * @defaultValue 5
            */
            autoCloseDelay: number;
            templates: {
                /** @defaultValue <div class="notifications"><div class="list"></div></div> */
                notifications: string;
                /** @defaultValue <div class="notification"></div> */
                notification : string;
            };
            selectors: {
                /** @defaultValue .notifications */
                notifications: string;
                /** @defaultValue .notification */
                notification:  string;
                /** @defaultValue .list */
                list:          string;
            };
            cssClass: {
                /** @defaultValue open */
                open:    string;
                /** @defaultValue success */
                success: string;
                /** @defaultValue danger */
                danger:  string;
                /** @defaultValue warning */
                warning: string;
                /** @defaultValue info */
                info:    string;
            };
            animations: {
                show: ( $notification, options ) => Promise<any>
                hide: ( $notification, options ) => Promise<any>
            };
        }

        type NotificationOptions = {
            closeDelay?: number | false;
            onClick?:    ( e: Event ) => void;
        }
    }
}
