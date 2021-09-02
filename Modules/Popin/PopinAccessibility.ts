import { toggleTabIndex, FOCUSABLE_ELEMENTS_SELECTOR } from './Tools';


export default class PopinAccessibility {

    #$elements!:     NodeList;
    #$firstElement!: HTMLElement;
    #$lastElement!:  HTMLElement;
    #$popin:         HTMLElement;


    constructor( $popin: HTMLElement ) {
        this.#$popin = $popin;

        this.refresh();
        this.toggleTabIndexNavigation( false );
    }



    focusFirstElement() {
        if ( !this.#$firstElement ) {
            return;
        }
        this.#$firstElement.focus();
    }


    handleBackwardTab( e ) {
        if ( this.#$elements.length < 1 || !this.#$firstElement ) {
            e.preventDefault();
            return;
        }
        if ( document.activeElement === this.#$firstElement ) {
            e.preventDefault();
            this.#$lastElement.focus();
        }
    }


    handleForwardTab( e ) {
        if ( this.#$elements.length < 1 || !this.#$lastElement ) {
            e.preventDefault();
            return;
        }
        if ( document.activeElement === this.#$lastElement ) {
            e.preventDefault();
            this.#$firstElement.focus();
        }
    }


    toggleTabIndexNavigation( activate ) {
        toggleTabIndex( this.#$elements, this.#$popin, activate );

        if ( activate ) {
            this.#$popin.focus();
        }
    }


    refresh() {
        this.#$elements     = this.#$popin.querySelectorAll( FOCUSABLE_ELEMENTS_SELECTOR );
        this.#$firstElement = this.#$elements[ 0 ] as HTMLElement;
        this.#$lastElement  = this.#$elements[ this.#$elements.length - 1 ] as HTMLElement;
    }
}
