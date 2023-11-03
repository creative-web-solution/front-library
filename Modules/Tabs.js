import { aClass, rClass } from '@creative-web-solution/front-library/DOM/Class';
import { on, off } from '@creative-web-solution/front-library/Events/EventsManager';
import { extend } from '@creative-web-solution/front-library/Helpers/extend';
import { next } from '@creative-web-solution/front-library/DOM/Traversing';
import { KeyboardHandler } from '@creative-web-solution/front-library/Events/KeyboardHandler';

const STATUS_ON = 'STATUS_ON';
const STATUS_OFF = 'STATUS_OFF';

/**
 * Tab of a tabs list
 * @class
 * @ignore
 *
 * @param {HTMLElement} $TAB
 * @param {Options} options
 */
function Tab( $TAB, options ) {
    let isOpen, originalOpenedState;

    const SELF          = this;
    const ID            = $TAB.getAttribute( 'aria-controls' );
    const $TAB_PANNEL   = document.getElementById( ID );

    isOpen = originalOpenedState = $TAB.getAttribute( 'aria-selected' ) === 'true';


    Object.defineProperty( this, 'isOpened', {
        "get": () => isOpen
    } );

    Object.defineProperty( this, 'index', {
        "get": () => options.index
    } );


    function changeTabState( isOpenAtStart ) {
        $TAB.setAttribute( 'aria-selected', isOpen ? 'true' : 'false' );
        $TAB.setAttribute( 'tabindex', isOpen ? '0' : '-1' );

        if ( isOpen && !isOpenAtStart ) {
            $TAB.focus();
        }
    }


    function openTab( isOpenAtStart ) {
        options.animations
                    .open( $TAB, $TAB_PANNEL )
                    .then( () => {

                        if ( isOpenAtStart && options.onOpenAtStart ) {
                            options.onOpenAtStart( $TAB, $TAB_PANNEL );
                        }
                        else if ( !isOpenAtStart && options.onOpen ) {
                            options.onOpen( $TAB, $TAB_PANNEL );
                        }
                    } );

        if ( options.onOpenTab ) {
            options.onOpenTab( SELF );
        }
        isOpen = true;
        changeTabState( isOpenAtStart );
    }


    function closeTab( autoClose ) {
        options.animations
                    .close( $TAB, $TAB_PANNEL )
                    .then( () => {
                        if ( options.onClose ) {
                            options.onClose( $TAB, $TAB_PANNEL, autoClose );
                        }
                    } );
        isOpen = false;
        changeTabState();
    }


    function toggleTab( e ) {
        e.preventDefault();

        if( isOpen ) {
            closeTab();
        }
        else {
            openTab();
        }
    }


    this.close = autoClose => {
        if( !isOpen ) {
            return;
        }
        closeTab( autoClose );
    }


    this.open = autoOpen => {
        if( isOpen ) {
            return;
        }
        openTab( autoOpen );
    }


    this.destroy = function() {
        options.animations.destroy( $TAB, $TAB_PANNEL );

        off( $TAB, {
            "eventsName": "click",
            "callback": toggleTab
        } );

        $TAB.setAttribute( 'aria-selected', originalOpenedState ? 'true' : 'false' );
    };


    on( $TAB, {
        "eventsName": "click",
        "callback": toggleTab
    } );

    if ( isOpen ) {
        openTab( true );
    }
}

const DEFAULT_OPTIONS = {
    "tabSelector":      "li[aria-selected]",
    "animations": {
        "open": function( $TAB, $TAB_PANNEL ) {
            aClass( [ $TAB, $TAB_PANNEL ], 'on' );

            return Promise.resolve();
        },
        "close": function( $TAB, $TAB_PANNEL ) {
            rClass( [ $TAB, $TAB_PANNEL ], 'on' );

            return Promise.resolve();
        },
        "destroy": function( $TAB, $TAB_PANNEL ) {
            rClass( [ $TAB, $TAB_PANNEL ], 'on' );

            return Promise.resolve();
        }
    },
    "onOpenAtStart": null,
    "onOpen": null,
    "onClose": null
};


/**
 * @typedef {Function} Tabs_callback
 * @memberof Tabs
 * @param {HTMLElement} $tab
 * @param {HTMLElement} $panel
 */

/**
 * @typedef {Function} Tabs_animation
 * @memberof Tabs
 * @param {HTMLElement} $tab
 * @param {HTMLElement} $panel
 *
 * @returns {Promise}
 */

/**
 * Tabs
 * @class
 *
 * @param {HTMLElement} $tabsWrapper
 * @param {Object} [userOptions]
 * @param {String} [userOptions.tabSelector='li[aria-selected]']
 * @param {Tabs_callback} [userOptions.onOpenAtStart]
 * @param {Tabs_callback} [userOptions.onOpen]
 * @param {Tabs_callback} [userOptions.onClose]
 * @param {Object} [userOptions.animations]
 * @param {Tabs_animation} [userOptions.animations.open]
 * @param {Tabs_animation} [userOptions.animations.close]
 * @param {Tabs_animation} [userOptions.animations.destroy]
 *
 * @example new Tabs( document.querySelector( '.tabs' ), {
 *      "tabSelector":     ".tab",
 *      "animations": {
 *          "open": function( $tab, $panel ) {
 *              aClass( [ $tab, $panel ], 'on' );
 *
 *              return Promise.resolve();
 *          },
 *          "close": function( $tab, $panel ) {
 *              rClass( [ $tab, $panel ], 'on' );
 *
 *              return Promise.resolve();
 *          },
 *          "destroy": function( $tab, $panel ) {
 *              rClass( [ $tab, $panel ], 'on' );
 *
 *              return Promise.resolve();
 *          }
 *      },
 *      "onOpenAtStart": function( $tab, $panel ) {
 *          console.log( 'open: ', $tab, $panel );
 *      },
 *      "onOpen": function( $tab, $panel ) {
 *          console.log( 'open: ', $tab, $panel );
 *      },
 *      "onClose":  function( $tab, $panel ) {
 *          console.log( 'close: ', $tab, $panel );
 *      }
 *  } );
 *
 * HTML:
 *
 * <div class="tabs">
 *   <ul role="tablist">
 *     <li role="tab" id="tab-1" tabindex="-1" aria-selected="false" aria-controls="panel-1">Tab 1</li>
 *     <li role="tab" id="tab-2" tabindex="0" aria-selected="true" aria-controls="panel-2">Tab 2</li>
 *     <li role="tab" id="tab-3" tabindex="-1" aria-selected="false" aria-controls="panel-3">Tab 3</li>
 *     <li role="tab" id="tab-4" tabindex="-1" aria-selected="false" aria-controls="panel-4">Tab 4</li>
 *   </ul>
 *   <div role="tabpanel" id="panel-1" aria-labelledby="tab-1" tabindex="0">
 *     [Content 1]
 *   </div>
 *   <div role="tabpanel" id="panel-2" aria-labelledby="tab-2" tabindex="0">
 *     [Content 2 (displayed at start)]
 *   </div>
 *   <div role="tabpanel" id="panel-3" aria-labelledby="tab-3" tabindex="0">
 *     [Content 3]
 *   </div>
 *   <div role="tabpanel" id="panel-4" aria-labelledby="tab-4" tabindex="0">
 *     [Content 4]
 *   </div>
 * </div>
 *
 * Set aria-selected to "true" and tabindex="0" on the tab you want open at start.
 * If the tabs are displayed vertically, add aria-orientation="vertical" on the role="tablist" element
 */
export function Tabs( $tabsWrapper, userOptions = {} ) {
    let options, tablist, status, lastOpenedTab, keyboard;

    options             = extend( DEFAULT_OPTIONS, userOptions );

    const $TABS_LIST    = $tabsWrapper.querySelector( '[role="tablist"]' );
    const $TABS         = $TABS_LIST.querySelectorAll( options.tabSelector );
    tablist             = [];
    status              = STATUS_OFF;

    const VERTICAL_MODE = $TABS_LIST.getAttribute( 'aria-orientation' ) === 'vertical';


    function onOpenTab( tab ) {
        if ( lastOpenedTab ) {
            lastOpenedTab.close( true );
        }

        lastOpenedTab = tab;
    }


    function onNext() {
        let indexToOpen = lastOpenedTab.index + 1 >= tablist.length ? 0 : lastOpenedTab.index + 1;

        tablist[ indexToOpen ].open();
    }


    function onPrevious() {
        let indexToOpen = lastOpenedTab.index - 1 < 0 ? tablist.length - 1 : lastOpenedTab.index - 1;

        tablist[ indexToOpen ].open();
    }


    function on() {
        let hasAnOpenedTab;

        if( status === STATUS_ON ) {
            return;
        }

        status = STATUS_ON;

        $TABS.forEach( ( $tab, index ) => {
            const tab = new Tab( $tab, {
                ...options,
                index,
                onOpenTab
            } );

            tablist.push( tab );

            if ( tab.isOpened ) {
                hasAnOpenedTab = tab.isOpened;
            }
        } );

        if ( !hasAnOpenedTab && tablist.length ) {
            tablist[ 0 ].open( true );
        }

        if ( VERTICAL_MODE ) {
            keyboard = new KeyboardHandler( $tabsWrapper, {
                "selector": options.tabSelector,
                "onUp": onPrevious,
                "onDown": onNext
            } );
        }
        else {
            keyboard = new KeyboardHandler( $tabsWrapper, {
                "selector": options.tabSelector,
                "onRight": onNext,
                "onLeft": onPrevious
            } );
        }
    }


    function off() {
        if( status === STATUS_OFF ){
            return;
        }
        status = STATUS_OFF;

        tablist.forEach( tab => {
            tab.destroy();
        } );

        keyboard.off();
    }


    /**
     * Remove all events, css class, ...
     */
    this.destroy = function() {
        off();
    };


    /**
     * Restart the module
     */
    this.update = function() {
        off();
        on();
    };


    on();
}
