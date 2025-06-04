import { aClass, rClass }       from '../../DOM/Class';
import { extend }               from '../../Helpers/Extend';
import { on, off }              from '../../Events/EventsManager';
import Tab                      from './Tab';


const DEFAULT_OPTIONS = {
    "tabSelector":      "button[aria-expanded]",
    "allowMultipleTab": false,
    "atLeastOneOpen":   false,
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
    }
};


/**
 * Accordion
 *
 * @example
 * ```ts
 * new Accordion( document.querySelector( '.accordion' ), {
 *      "tabSelector":     ".tab",
 *      "allowMultipleTab": false,
 *      "atLeastOneOpen":   false,
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
 * ```
 *
 * HTML:
 *
 * ```html
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
 * ```
 *
 * Set aria-expanded to "true" on the tab you want open at start
 */
export default class Accordion {
    #$accordionWrapper: HTMLElement;
    #options:       FLib.Accordion.Options;
    #$tabs:         NodeListOf<HTMLElement>;
    #tablist        = new Map<HTMLElement, Tab>();
    #status:        string;
    #lastOpenedTabs = new Set<Tab>();


    #STATUS_ON  = 'STATUS_ON';
    #STATUS_OFF = 'STATUS_OFF';


    constructor( $accordionWrapper: HTMLElement, userOptions: FLib.Accordion.OptionsInit ) {
        this.#$accordionWrapper = $accordionWrapper;

        this.#options       = extend( DEFAULT_OPTIONS, userOptions );

        this.#$tabs         = $accordionWrapper.querySelectorAll( this.#options.tabSelector );
        this.#status        = this.#STATUS_OFF;

        this.#on();
    }

    #on = (): void => {
        if( this.#status === this.#STATUS_ON ){
            return;
        }

        this.#status = this.#STATUS_ON;

        this.#$tabs.forEach( ( $tab, index ) => {
            this.#tablist.set($tab, new Tab( $tab, {
                ...this.#options,
                index,
            } ) );
        } );

        on( this.#$accordionWrapper, {
            "eventsName": "click",
            "selector": this.#options.tabSelector,
            "callback": this.#toggleTab
        } );
    }


    #off = (): void => {
        if( this.#status === this.#STATUS_OFF ){
            return;
        }

        this.#status = this.#STATUS_OFF;

        this.#tablist.forEach( tab => {
            tab.destroy();
        } );

        this.#tablist.clear();

        off( this.#$accordionWrapper, {
            "eventsName": "click",
            "callback": this.#toggleTab
        } );
    }

    #toggleTab = ( e: Event, $target: HTMLElement ): void => {
        e.preventDefault();

        const tab = this.#tablist.get($target);

        if (!tab) {
            return;
        }

        if (tab.isOpen) {
            this.closeTab(tab)
            return;
        }

        this.openTab(tab)
    }

    closeTab(tab: Tab): this {
        if (this.#options.atLeastOneOpen && this.#lastOpenedTabs.size < 2) {
            return this;
        }

        tab.close(false);
        this.#lastOpenedTabs.delete(tab);

        return this;
    }

    openTab(tab: Tab): this {
        if (!this.#options.allowMultipleTab && this.#lastOpenedTabs.size > 0) {
            this.#lastOpenedTabs.forEach(tab => {
                tab.close(true);
            });
            this.#lastOpenedTabs.clear();
        }

        tab.open();
        this.#lastOpenedTabs.add(tab);

        return this;
    }

    openTabByElement($tab: HTMLElement): this {
        const tab = this.#tablist.get($tab);

        if (tab) {
            this.openTab(tab);
        }

        return this;
    }

    /**
     * Remove all events, css class, ...
     */
    destroy(): this {
        this.#off();

        return this;
    }


    /**
     * Restart the module
     */
    update(): this {
        this.#off();
        this.#on();

        return this;
    }
}
