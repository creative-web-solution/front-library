# Notifications

## Javascript

**Example with all default parameters**

```js
let notifSys = new Notification( {
    "$wrapper": document.body,
    "autoCloseDelay": "5", // s
    "onClick": undefined,
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
} );

// Shortcut functions
notifSys.addInfo( 'Here is a information notification' );

notifSys.addSuccess( 'Here is a success notification' );

notifSys.addWarning( 'Here is a warning notification' );

notifSys.addDanger( 'Here is a danger notification' );


// Generic function
notifSys.add( 'Here is another danger notification', Notifications.DANGER );


// Autoclose after 2s instead of the default 5
notifSys.addDanger( 'Here is a danger notification', {
    "closeDelay": 2
} );

// With a click callback
notifSys.addDanger( 'Here is a danger notification', {
    "onClick": ( originalEvent ) => {
        console.log( 'Specific callback' );
    }
} );

```

**Available notification types:**

* Notifications.INFO
* Notifications.SUCCESS
* Notifications.WARNING
* Notifications.DANGER



## Styles

Example of CSS:

```css
.notifications {
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 20;
  width: 0;
  overflow: hidden;
  display: none;
}
.notifications.open {
  display: block;
  width: 200px;
}
.notification {
  position: relative;
  right: 0;
  width: 100%;
  transform: translateX(100%);
  padding: 20px;
  font-size: 1.2rem;
  line-height: 1.4;
  background-color: #66d;
  transition: transform 0.2s ease-out;
  box-sizing: border-box;
}
.notification.open {
    transform: translateX(0);
}
.notification.danger,
.notification.success,
.notification.warning {
  color: #fff;
}
.notification.danger {
  background-color: #cd0017;
}
.notification.success {
  background-color: #94a84d;
}
.notification.warning {
  background-color: #d88a0e;
}
```
