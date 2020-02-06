import { aClass, rClass } from 'front-library/DOM/Class';
import { on, off } from 'front-library/Events/EventsManager';
import { extend } from 'front-library/Helpers/Extend';
import { next } from 'front-library/DOM/Traversing';

const STATUS_ON = 'STATUS_ON';
const STATUS_OFF = 'STATUS_OFF';

/**
 * Tab of an accordion
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
    const $TAB_PANNEL   = ID ? document.getElementById( ID ) : next( $TAB );

    isOpen = originalOpenedState = $TAB.getAttribute( 'aria-expanded' ) === 'true';


    function changeTabState() {
        $TAB.setAttribute( 'aria-expanded', isOpen ? 'true' : 'false' );
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
        changeTabState();
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


    this.close = ( autoClose ) => {
        if( !isOpen ) {
            return;
        }
        closeTab( autoClose );
    }


    this.destroy = function() {
        options.animations.destroy( $TAB, $TAB_PANNEL );

        off( $TAB, {
            "eventsName": "click",
            "callback": toggleTab
        } );

        $TAB.setAttribute( 'aria-expanded', originalOpenedState ? 'true' : 'false' );
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
    "tabSelector":      "button[aria-expanded]",
    "allowMultipleTab": false,
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
 * @typedef {Function} Accordion_callback
 * @memberof Accordion
 * @param {HTMLElement} $tab
 * @param {HTMLElement} $panel
 */

/**
 * @typedef {Function} Accordion_animation
 * @memberof Accordion
 * @param {HTMLElement} $tab
 * @param {HTMLElement} $panel
 *
 * @returns {Promise}
 */

/**
 * Accordion
 * @class
 *
 * @param {HTMLElement} $accordionWrapper
 * @param {Object} [userOptions]
 * @param {String} [userOptions.tabSelector='button[aria-expanded]']
 * @param {Boolean} [userOptions.allowMultipleTab=false]
 * @param {Accordion_callback} [userOptions.onOpenAtStart]
 * @param {Accordion_callback} [userOptions.onOpen]
 * @param {Accordion_callback} [userOptions.onClose]
 * @param {Object} [userOptions.animations]
 * @param {Accordion_animation} [userOptions.animations.open]
 * @param {Accordion_animation} [userOptions.animations.close]
 * @param {Accordion_animation} [userOptions.animations.destroy]
 *
 * @example new Accordion( document.querySelector( '.accordion' ), {
 *      "tabSelector":     ".tab",
 *      "allowMultipleTab": false,
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
 * <div class="accordion">
 *     <button aria-expanded="true" class="tab" aria-controls="panel-1">Button name</button>
 *     <div id="panel-1" class="panel">
 *        <p>Content</p>
 *     </div>
 *
 *     <button aria-expanded="false" class="tab" aria-controls="panel-2">Button name</button>
 *     <div id="panel-2" class="panel">
 *        <p>Content</p>
 *     </div>
 * </div>
 *
 * Set aria-expanded to "true" on the tab you want open at start
 */
export function Accordion( $accordionWrapper, userOptions = {} ) {
    let options, $tabs, tablist, status, lastOpenedTab;

    options = extend( DEFAULT_OPTIONS, userOptions );

    $tabs = $accordionWrapper.querySelectorAll( options.tabSelector );
    tablist = [];
    status = STATUS_OFF;


    function onOpenTab( tab ) {
        if ( lastOpenedTab ) {
            lastOpenedTab.close( true );
        }

        lastOpenedTab = tab;
    }


    function on(){
        if( status === STATUS_ON ){
            return;
        }
        status = STATUS_ON;

        $tabs.forEach( ( $tab, index ) => {
            tablist.push( new Tab( $tab, {
                ...options,
                index,
                "onOpenTab": options.allowMultipleTab ? null : onOpenTab
            } ) );
        } );
    }


    function off() {
        if( status === STATUS_OFF ){
            return;
        }
        status = STATUS_OFF;

        tablist.forEach( tab => {
            tab.destroy();
        } );
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
