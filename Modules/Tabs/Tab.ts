import { on, off }        from '../../Events/EventsManager';


/**
 * Tab of a tabs list
 */
export default class Tab {

    #options:             FLib.Tabs.TabOptions;
    #$TAB:                HTMLElement;
    #$TAB_PANNEL:         HTMLElement;
    #isOpen:              boolean;
    #originalOpenedState: boolean;


    get isOpened(): boolean {
        return this.#isOpen;
    }

    get index(): number {
        return this.#options.index;
    }


    constructor( $TAB: HTMLElement, options: FLib.Tabs.TabOptions ) {
        this.#options = options;
        this.#$TAB    = $TAB;

        const ID = $TAB.getAttribute( 'aria-controls' );

        if ( !ID ) {
            throw `Missing "aria-controls" attributes on tab element`;
        }

        this.#$TAB_PANNEL = document.getElementById( ID ) as HTMLElement;

        if ( !this.#$TAB_PANNEL ) {
            throw `Unable to find panel element id="${ ID }" attributes on tab element`;
        }

        this.#isOpen = this.#originalOpenedState = $TAB.getAttribute( 'aria-selected' ) === 'true';

        on( $TAB, {
            "eventsName": "click",
            "callback":   this.#toggleTab
        } );

        if ( this.#isOpen ) {
            this.#openTab( true );
        }
    }


    #changeTabState = ( isOpenAtStart?: boolean ): void => {
        this.#$TAB.setAttribute( 'aria-selected', this.#isOpen ? 'true' : 'false' );
        this.#$TAB.setAttribute( 'tabindex', this.#isOpen ? '0' : '-1' );

        if ( this.#isOpen && !isOpenAtStart ) {
            this.#$TAB.focus();
        }

    }


    #openTab = ( isOpenAtStart?: boolean ): void => {
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
        this.#changeTabState( isOpenAtStart );
    }


    #closeTab = ( autoClose?: boolean ): void => {
        this.#options.animations
                    .close( this.#$TAB, this.#$TAB_PANNEL )
                    .then( () => {
                        if ( this.#options.onClose ) {
                            this.#options.onClose( this.#$TAB, this.#$TAB_PANNEL, autoClose );
                        }
                    } );
        this.#isOpen = false;
        this.#changeTabState();
    }


    #toggleTab = ( e: Event ): void => {
        e.preventDefault();

        if( this.#isOpen ) {
            this.#closeTab();
        }
        else {
            this.#openTab();
        }
    }


    close( autoClose?: boolean ): this {
        if( this.#isOpen ) {
            this.#closeTab( autoClose );
        }

        return this;
    }


    open( autoOpen?: boolean ): this {
        if( !this.#isOpen ) {
            this.#openTab( autoOpen );
        }

        return this;
    }


    destroy(): this {
        this.#options.animations.destroy( this.#$TAB, this.#$TAB_PANNEL );

        off( this.#$TAB, {
            "eventsName": "click",
            "callback": this.#toggleTab
        } );

        this.#$TAB.setAttribute( 'aria-selected', this.#originalOpenedState ? 'true' : 'false' );

        return this;
    }
}
