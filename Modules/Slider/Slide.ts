import { outerHeight } from '../../DOM/OuterSize';


let customeSlideId = 0;


export class Slide {
    #options;
    #$slide:        HTMLElement;
    #$links:        NodeList;
    #lastOffset:    number;
    #size:          number;
    #currentPage:   number;
    #offsetToGo:    number;
    #isLast:        boolean;
    #delay:         number;
    #x:             number;
    #id:            string;


    get id(): string {
        return this.#id;
    }

    get index(): number {
        return this.#options.index;
    }

    get position(): number {
        return this.#options.index + 1;
    }

    get currentPage(): number {
        return this.#currentPage;
    }

    get isFirst(): boolean {
        return this.#options.index === 0;
    }

    get isLast(): boolean {
        return this.#isLast;
    }

    get offsetToGo(): number {
        return this.#offsetToGo;
    }

    get delay(): number {
        return this.#delay;
    }

    get x(): number {
        return this.#x;
    }


    constructor( options: FLib.Slider.SlideOptions ) {
        this.#options = options;
        this.#$slide  = options.$slide;
        this.#id      = options.$slide.id;
        this.#$links  = this.#$slide.querySelectorAll( 'a,button,input,textarea,select' );

        this.#size    = 100; // %

        this.#lastOffset = -1;

        this.#currentPage = Math.floor( options.index / options.slidePerPage ) + 1;
        this.#offsetToGo = options.index;

        if ( options.moveByPage ) {
            this.#isLast = this.#currentPage=== options.nbPages;
        }
        else {
            this.#isLast = options.index === options.nbSlides - 1;
        }

        this.#delay = this.#$slide.hasAttribute( 'data-delay' )
            ? parseInt( this.#$slide.getAttribute( 'data-delay' ) as string, 10 )
            : 0;

        this.#x = 0;

        if ( !this.#id ) {
            this.#id = this.#$slide.id = this.#getNextSlideId();
        }

        this.#$slide.setAttribute( 'role', 'tabpanel' )

    }


    #getNextSlideId = (): string => {
        return `__mdl_sld_${ ++customeSlideId }`;
    }


    #toggleElementsFocusability = ( activate: boolean ): void => {
        if ( !this.#$links.length ) {
            return;
        }

        this.#$links.forEach( $link => {
            ( $link as HTMLElement).setAttribute( 'tabindex', activate ? '0' : '-1 ');
        } );
    }


    isVisible( offset?: number ): boolean {
        offset = offset || this.#lastOffset;

        return (
            offset >= -1 * this.#options.nbSlideVisibleBefore &&
            offset < this.#options.nbSlideVisibleAfter + this.#options.slidePerPage
        );
    }


    isActive( offset?: number ): boolean {
        offset = offset || this.#lastOffset
        return offset >= 0 && offset < this.#options.slidePerPage
    }


    #willMove = ( offset: number, direction: FLib.Slider.SlideDirection ): boolean => {
        if ( direction === -1 ) {
            return (
                offset >= -1 * this.#options.nbSlideVisibleBefore - 1 &&
                offset < this.#options.nbSlideVisibleAfter + this.#options.slidePerPage
            );
        }
        else {
            return (
                offset >= -1 * this.#options.nbSlideVisibleBefore &&
                offset <= this.#options.nbSlideVisibleAfter + this.#options.slidePerPage
            );
        }
    }


    #getXMax = ( offset: number ): number => {
        return this.#size * Math.min( offset, this.#options.nbSlideVisibleAfter + this.#options.slidePerPage );
    }


    #getXMin = ( offset: number ): number => {
        return this.#size * Math.max( offset, -1 * this.#options.nbSlideVisibleBefore - 1 );
    }


    getHeight(): number {
        return outerHeight( this.#$slide );
    }


    setOffsetToGo( offset: number ): void {
        this.#lastOffset = this.#offsetToGo;
        this.#offsetToGo = offset;
    }


    init(): void {
        if ( this.#offsetToGo === 0 ) {
            this.#x = 0;
        }
        else if ( this.#offsetToGo > 0 ) {
            this.#x = this.#getXMax( this.offsetToGo );
        }
        else if ( this.#offsetToGo < 0 ) {
            this.#x = this.#getXMin( this.offsetToGo );
        }

        this.#options._setStyle( this.#$slide, {
            "x": 0,
            "xPercent": this.#x,
            "position": this.#offsetToGo === 0 ? 'relative' : 'absolute'
        } );

        this.#lastOffset = this.#offsetToGo;

        this[ this.isActive() ? 'activate' : 'deactivate' ]();
    }


    initMoveTo( direction: FLib.Slider.SlideDirection ): void {
        let x;

        if (
            this.isVisible( this.#lastOffset ) ||
            !this.#willMove( this.#offsetToGo, direction )
        ) {
            return;
        }

        if ( direction === -1 ) {
            x = this.#getXMax( this.#offsetToGo - 1 );
        }
        else {
            x = this.#getXMin( this.#offsetToGo + 1 );
        }

        this.#x = x;

        this.#options._setStyle( this.#$slide, {
            "x":        0,
            "xPercent": x
        } );
    }


    moveTo( direction: FLib.Slider.SlideDirection, easing ): Promise<any> {
        let _resolve;

        if (
            !(
                this.#willMove( this.#offsetToGo, direction ) ||
                this.#willMove( this.#lastOffset, direction )
            )
        ) {
            this.#lastOffset = this.#offsetToGo;
            return Promise.resolve();
        }

        this.#lastOffset = this.#offsetToGo;
        const positionning     = this.#offsetToGo === 0 ? 'relative' : 'absolute';
        const x                = this.offsetToGo * this.#size;

        this.#x          = x;

        const promise = new Promise( function( resolve ) {
            _resolve = resolve;
        } );

        this.#options._tweenTo( this.#$slide, {
            "duration": this.#options.speed,
            "x": 0,
            "xPercent": this.x,
            "ease": easing,
            "onComplete": () => {
                this.#options._setStyle( this.#$slide, {
                    "position": positionning
                } );

                this[ this.isActive() ? 'activate' : 'deactivate' ]();

                _resolve();
            }
        } );

        return promise;
    }


    activate(): void {
        this.#$slide.setAttribute( 'aria-hidden', "false" );
        this.#toggleElementsFocusability( true );
    }


    deactivate(): void {
        this.#$slide.setAttribute( 'aria-hidden', "true" );
        this.#toggleElementsFocusability( false );
    }


    destroy(): void {
        this.#$slide.removeAttribute( 'aria-hidden' );
        this.#$links.forEach( $link => {
            ( $link as HTMLElement ).removeAttribute( 'tabindex' );
        } );

        this.#options._killTweens( this.#$slide );
        this.#options._setStyle( this.#$slide, {
            "clearProps": "all"
        } );
    }


    getSlideProperties(): FLib.Slider.SlideProperties {
        return {
            "$slide":    this.#$slide,
            "id":        this.id,
            "delay":     this.delay,
            "index":     this.index,
            "position":  this.position,
            "isFirst":   this.isFirst,
            "isLast":    this.isLast,
            "isVisible": this.isVisible(),
            "isActive":  this.isActive(),
            "page":      this.currentPage,
            "pageIndex": this.currentPage - 1,
        }
    }
}
