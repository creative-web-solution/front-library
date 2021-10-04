import { toggleTabIndex, FOCUSABLE_ELEMENTS_SELECTOR } from './Tools';


export default class PopinAccessibility {

    #$elements:      NodeListOf<HTMLElement> | undefined;
    #$firstElement:  HTMLElement | undefined;
    #$lastElement:   HTMLElement | undefined;
    #$popin:         HTMLElement;


    constructor( $popin: HTMLElement ) {
        this.#$popin = $popin;

        this.refresh();
        this.toggleTabIndexNavigation( false );
    }



    focusFirstElement(): void {
        if ( !this.#$firstElement ) {
            return;
        }
        this.#$firstElement.focus();
    }


    handleBackwardTab( e: Event ): void {
        if ( !this.#$elements?.length || !this.#$firstElement ) {
            e.preventDefault();
            return;
        }
        if ( document.activeElement === this.#$firstElement ) {
            e.preventDefault();
            this.#$lastElement?.focus();
        }
    }


    handleForwardTab( e: Event ): void {
        if ( this.#$elements?.length || !this.#$lastElement ) {
            e.preventDefault();
            return;
        }
        if ( document.activeElement === this.#$lastElement ) {
            e.preventDefault();
            this.#$firstElement?.focus();
        }
    }


    toggleTabIndexNavigation( activate: boolean ): void {
        toggleTabIndex( this.#$elements, this.#$popin, activate );

        if ( activate ) {
            this.#$popin.focus();
        }
    }


    refresh(): void {
        this.#$elements     = this.#$popin.querySelectorAll( FOCUSABLE_ELEMENTS_SELECTOR );
        this.#$firstElement = this.#$elements[ 0 ] as HTMLElement;
        this.#$lastElement  = this.#$elements[ this.#$elements.length - 1 ] as HTMLElement;
    }
}
