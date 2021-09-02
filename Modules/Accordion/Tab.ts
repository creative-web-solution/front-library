import { on, off } from '../../Events/EventsManager';
import { next }    from '../../DOM/Traversing';


/**
 * Tab of an accordion
 */
export default class Tab {
    #isOpen:              boolean;
    #originalOpenedState: boolean;
    #$TAB_PANNEL:         HTMLElement | null;
    #options;
    #$TAB;


    constructor( $TAB: HTMLElement, options: AccordionTabOptionsType ) {
        this.#options     = options;
        this.#$TAB        = $TAB ;

        const ID          = $TAB.getAttribute( 'aria-controls' );
        this.#$TAB_PANNEL = ID ? document.getElementById( ID ) : next( $TAB ) as HTMLElement;

        this.#isOpen = this.#originalOpenedState = $TAB.getAttribute( 'aria-expanded' ) === 'true';

        on( $TAB, {
            "eventsName": "click",
            "callback": this.#toggleTab
        } );

        if ( this.#isOpen ) {
            this.openTab( true );
        }
    }


    private changeTabState() {
        this.#$TAB.setAttribute( 'aria-expanded', this.#isOpen ? 'true' : 'false' );
    }


    private openTab( isOpenAtStart?: boolean ) {
        this.#options.animations
                    .open( this.#$TAB, this.#$TAB_PANNEL )
                    .then( () => {

                        if ( isOpenAtStart && this.#options.onOpenAtStart ) {
                            this.#options.onOpenAtStart( this.#$TAB, this.#$TAB_PANNEL );
                        }
                        else if ( !isOpenAtStart && this.#options.onOpen ) {
                            this.#options.onOpen( this.#$TAB, this.#$TAB_PANNEL );
                        }
                    } );

        if ( this.#options.onOpenTab ) {
            this.#options.onOpenTab( this );
        }
        this.#isOpen = true;
        this.changeTabState();
    }


    private closeTab( autoClose?: boolean ) {
        this.#options.animations
                    .close( this.#$TAB, this.#$TAB_PANNEL )
                    .then( () => {
                        if ( this.#options.onClose ) {
                            this.#options.onClose( this.#$TAB, this.#$TAB_PANNEL, autoClose );
                        }
                    } );

        this.#isOpen = false;
        this.changeTabState();
    }


    #toggleTab = ( e: Event ) => {
        e.preventDefault();

        if( this.#isOpen && ( !this.#options.atLeastOneOpen || this.#options.allowMultipleTab ) ) {
            this.closeTab();
        }
        else if( !this.#isOpen ) {
            this.openTab();
        }
    }


    close( autoClose?: boolean ) {
        if( !this.#isOpen ) {
            return;
        }

        this.closeTab( autoClose );
    }


    destroy() {
        this.#options.animations.destroy( this.#$TAB, this.#$TAB_PANNEL );

        off( this.#$TAB, {
            "eventsName": "click",
            "callback":   this.#toggleTab
        } );

        this.#$TAB.setAttribute( 'aria-expanded', this.#originalOpenedState ? 'true' : 'false' );
    };
}
