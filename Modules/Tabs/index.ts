import { aClass, rClass }  from '../../DOM/Class';
import { extend }          from '../../Helpers/Extend';
import KeyboardHandler     from '../../Events/KeyboardHandler';
import Tab                 from './Tab';


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
 * Tabs
 *
 * @example
 * new Tabs( document.querySelector( '.tabs' ), {
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
export default class Tabs {

    #options:        TabsOptionsType;
    #$TABS_LIST:     HTMLElement;
    #$TABS:          NodeList;
    #tablist:        Tab[];
    #status:         string;
    #VERTICAL_MODE:  boolean;
        #lastOpenedTab!: Tab;
    #keyboard!:      KeyboardHandler;
    #$tabsWrapper:   HTMLElement;

    #STATUS_ON  = 'STATUS_ON';
    #STATUS_OFF = 'STATUS_OFF';

    constructor( $tabsWrapper, userOptions: TabsOptionsType ) {
        this.#$tabsWrapper  = $tabsWrapper;

        this.#options       = extend( DEFAULT_OPTIONS, userOptions );

        this.#$TABS_LIST    = $tabsWrapper.querySelector( '[role="tablist"]' );
        this.#$TABS         = this.#$TABS_LIST.querySelectorAll( this.#options.tabSelector );
        this.#tablist       = [];
        this.#status        = this.#STATUS_OFF;

        this.#VERTICAL_MODE = this.#$TABS_LIST.getAttribute( 'aria-orientation' ) === 'vertical';

        this.on();
    }


    #onOpenTab = ( tab: Tab ) => {
        if ( this.#lastOpenedTab ) {
            this.#lastOpenedTab.close( true );
        }

        this.#lastOpenedTab = tab;
    }


    private onNext() {
        const indexToOpen = this.#lastOpenedTab.index + 1 >= this.#tablist.length ? 0 : this.#lastOpenedTab.index + 1;

        this.#tablist[ indexToOpen ].open();
    }


    private onPrevious() {
        const indexToOpen = this.#lastOpenedTab.index - 1 < 0 ? this.#tablist.length - 1 : this.#lastOpenedTab.index - 1;

        this.#tablist[ indexToOpen ].open();
    }


    private on() {
        let hasAnOpenedTab;

        if( this.#status === this.#STATUS_ON ) {
            return;
        }

        this.#status = this.#STATUS_ON;

        this.#$TABS.forEach( ( $tab, index ) => {
            const tab = new Tab( $tab as HTMLElement, {
                ...this.#options,
                index,
                "onOpenTab": this.#onOpenTab
            } );

            this.#tablist.push( tab );

            if ( tab.isOpened ) {
                hasAnOpenedTab = tab.isOpened;
            }
        } );

        if ( !hasAnOpenedTab && this.#tablist.length ) {
            this.#tablist[ 0 ].open( true );
        }

        if ( this.#VERTICAL_MODE ) {
            this.#keyboard = new KeyboardHandler( this.#$tabsWrapper, {
                "selector": this.#options.tabSelector,
                "onUp":     this.onPrevious,
                "onDown":   this.onNext
            } );
        }
        else {
            this.#keyboard = new KeyboardHandler( this.#$tabsWrapper, {
                "selector": this.#options.tabSelector,
                "onRight":  this.onNext,
                "onLeft":   this.onPrevious
            } );
        }
    }


    private off() {
        if( this.#status === this.#STATUS_OFF ){
            return;
        }
        this.#status = this.#STATUS_OFF;

        this.#tablist.forEach( tab => {
            tab.destroy();
        } );

        this.#keyboard.off();
    }


    /**
     * Remove all events, css class, ...
     */
    destroy() {
        this.off();
    };


    /**
     * Restart the module
     */
    update() {
        this.off();
        this.on();
    };
}
