type NotificationType =  'info' | 'success' | 'warning' | 'danger';

type NotificationsOptionsType = {
    /** @default document.body */
    $wrapper?: HTMLElement;
    onClick?:  ( notification: Notification ) => void;
    /**
     * In second
     * @default 5
    */
    autoCloseDelay?: number;
    templates?: {
        /** @default <div class="notifications"><div class="list"></div></div> */
        notifications: string;
        /** @default <div class="notification"></div> */
        notification : string;
    };
    selectors?: {
        /** @default .notifications */
        notifications?: string;
        /** @default .notification */
        notification?:  string;
        /** @default .list */
        list?:          string;
    };
    cssClass?: {
        /** @default open */
        open?:    string;
        /** @default success */
        success?: string;
        /** @default danger */
        danger?:  string;
        /** @default warning */
        warning?: string;
        /** @default info */
        info?:    string;
    };
    animations?: {
        show?: ( $notification, options ) => Promise
        hide?: ( $notification, options ) => Promise
    };
}

type NotificationOptionsType = {
    closeDelay?: number | false;
    onClick?:    ( e: Event ) => void;
}
