import { aClass, rClass }       from '../../DOM/Class';
import { extend }               from '../../Helpers/Extend';
import Tab                      from './Tab';


const DEFAULT_OPTIONS: AccordionOptionsType = {
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
export default class Accordion {
    #options:       AccordionOptionsType;
    #$tabs:         NodeList;
    #tablist:       Tab[];
    #status:        string;
    #lastOpenedTab: Tab | null = null;


    #STATUS_ON  = 'STATUS_ON';
    #STATUS_OFF = 'STATUS_OFF';


    constructor( $accordionWrapper: HTMLElement, userOptions: AccordionOptionsType ) {

        this.#options       = extend( DEFAULT_OPTIONS, userOptions );

        this.#$tabs         = $accordionWrapper.querySelectorAll( this.#options.tabSelector );
        this.#tablist       = [];
        this.#status        = this.#STATUS_OFF;

        this.on();
    }


    #onOpenTab = ( tab: Tab ) => {
        if ( this.#lastOpenedTab ) {
            this.#lastOpenedTab.close( true );
        }

        this.#lastOpenedTab = tab;
    }


    private on(){
        if( this.#status === this.#STATUS_ON ){
            return;
        }

        this.#status = this.#STATUS_ON;

        this.#$tabs.forEach( ( $tab, index ) => {
            this.#tablist.push( new Tab( $tab as HTMLElement, {
                ...this.#options,
                index,
                "onOpenTab": this.#options.allowMultipleTab ? null : this.#onOpenTab
            } ) );
        } );
    }


    private off() {
        if( this.#status === this.#STATUS_OFF ){
            return;
        }

        this.#status = this.#STATUS_OFF;

        this.#tablist.forEach( tab => {
            tab.destroy();
        } );

        this.#tablist.length = 0;
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
