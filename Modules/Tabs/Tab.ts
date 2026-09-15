import { on, off }        from '../../Events/EventsManager';


/**
 * Tab of a tabs list
 */
export default class Tab {

    #options: FLib.Tabs.TabOptions;
    #$tab: HTMLElement;
    #panel!: HTMLElement;
    #isOpen: boolean = false;
    #originalOpenedState: boolean = false;


    get isOpened(): boolean {
        return this.#isOpen;
    }

    get index(): number {
        return this.#options.index;
    }


    constructor( $tab: HTMLElement, options: FLib.Tabs.TabOptions ) {
        this.#options = options;
        this.#$tab    = $tab;

        this.#init();
    }

    #init(): void {
        const ID = this.#$tab.getAttribute( 'aria-controls' );

        if ( !ID ) {
            throw `Missing "aria-controls" attributes on tab element`;
        }

        this.#panel = document.getElementById( ID ) as HTMLElement;

        if ( !this.#panel ) {
            throw `Unable to find panel element id="${ ID }" attributes on tab element`;
        }

        this.#isOpen = this.#originalOpenedState = this.#$tab.getAttribute( 'aria-selected' ) === 'true';
        this.#panel.inert = true;

        on( this.#$tab, {
            "eventsName": "click",
            "callback":   this.#toggleTab
        } );

        on( this.#$tab, {
            "eventsName": "focus",
            "callback":   this.#onFocusTab
        } );

        if ( this.#isOpen ) {
            this.#openTab( true );
        }
    }

    #onFocusTab = (): void => {
        this.#options.onFocusTab?.(this);
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


    #openTab = ( isOpenAtStart?: boolean ): void => {
        this.#panel.inert = false;
        this.#options.animations
            .open( this.#$tab, this.#panel )
            .then( () => {
                if ( isOpenAtStart && this.#options.onOpenAtStart ) {
                    this.#options.onOpenAtStart( this.#$tab, this.#panel );
                }
                else if ( !isOpenAtStart && this.#options.onOpen ) {
                    this.#options.onOpen( this.#$tab, this.#panel );
                }
            } );

        if ( this.#options.onOpenTab ) {
            this.#options.onOpenTab( this );
        }
        this.#isOpen = true;
        this.#changeTabState( isOpenAtStart );
    }


    #closeTab = ( autoClose?: boolean ): void => {
        this.#panel.inert = true;
        this.#options.animations
                    .close( this.#$tab, this.#panel )
                    .then( () => {
                        if ( this.#options.onClose ) {
                            this.#options.onClose( this.#$tab, this.#panel, autoClose );
                        }
                    } );
        this.#isOpen = false;
        this.#changeTabState();
    }


    #changeTabState = ( isOpenAtStart?: boolean ): void => {
        this.#$tab.setAttribute( 'aria-selected', this.#isOpen ? 'true' : 'false' );
        this.#$tab.setAttribute( 'tabindex', this.#isOpen ? '0' : '-1' );

        if ( this.#isOpen && !isOpenAtStart ) {
            this.#$tab.focus();
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

    focusTab(): this {
        this.#$tab.focus();
        return this;
    }


    destroy(): this {
        this.#options.animations.destroy( this.#$tab, this.#panel );
        this.#panel.inert = false;

        off( this.#$tab, {
            "eventsName": "click",
            "callback": this.#toggleTab
        } );

        this.#$tab.setAttribute( 'aria-selected', this.#originalOpenedState ? 'true' : 'false' );

        return this;
    }
}
