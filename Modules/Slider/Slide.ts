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


    get id() {
        return this.#id;
    }

    get index() {
        return this.#options.index;
    }

    get position() {
        return this.#options.index + 1;
    }

    get currentPage() {
        return this.#currentPage;
    }

    get isFirst() {
        return this.#options.index === 0;
    }

    get isLast() {
        return this.#isLast;
    }

    get offsetToGo() {
        return this.#offsetToGo;
    }

    get delay() {
        return this.#delay;
    }

    get x() {
        return this.#x;
    }


    constructor( options: SlideOptionsType ) {
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
            this.#id = this.#$slide.id = this.getNextSlideId();
        }

        this.#$slide.setAttribute( 'role', 'tabpanel' )

    }


    private getNextSlideId() {
        return `__mdl_sld_${ ++customeSlideId }`;
    }


    private toggleElementsFocusability( activate: boolean ) {
        if ( !this.#$links.length ) {
            return
        }

        this.#$links.forEach( $link => {
            ( $link as HTMLElement).setAttribute( 'tabindex', activate ? '0' : '-1 ');
        } );
    }


    isVisible( offset?: number ) {
        offset = offset || this.#lastOffset;

        return (
            offset >= -1 * this.#options.nbSlideVisibleBefore &&
            offset < this.#options.nbSlideVisibleAfter + this.#options.slidePerPage
        );
    };


    isActive( offset?: number ) {
        offset = offset || this.#lastOffset
        return offset >= 0 && offset < this.#options.slidePerPage
    }


    private willMove( offset: number, direction: SlideDirectionType ) {
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


    private getXMax( offset: number ) {
        return (
            this.#size *
            Math.min( offset, this.#options.nbSlideVisibleAfter + this.#options.slidePerPage )
        );
    }


    private getXMin( offset: number ) {
        return this.#size * Math.max( offset, -1 * this.#options.nbSlideVisibleBefore - 1 );
    }


    getHeight() {
        return outerHeight( this.#$slide );
    };


    setOffsetToGo( offset ) {
        this.#lastOffset = this.#offsetToGo;
        this.#offsetToGo = offset;
    };


    init() {
        if ( this.#offsetToGo === 0 ) {
            this.#x = 0;
        }
        else if ( this.#offsetToGo > 0 ) {
            this.#x = this.getXMax( this.offsetToGo );
        }
        else if ( this.#offsetToGo < 0 ) {
            this.#x = this.getXMin( this.offsetToGo );
        }

        this.#options._setStyle( this.#$slide, {
            "x": 0,
            "xPercent": this.#x,
            "position": this.#offsetToGo === 0 ? 'relative' : 'absolute'
        } );

        this.#lastOffset = this.#offsetToGo;

        this[ this.isActive() ? 'activate' : 'deactivate' ]();
    }


    initMoveTo( direction: SlideDirectionType ) {
        let x;

        if (
            this.isVisible( this.#lastOffset ) ||
            !this.willMove( this.#offsetToGo, direction )
        ) {
            return;
        }

        if ( direction === -1 ) {
            x = this.getXMax( this.#offsetToGo - 1 );
        }
        else {
            x = this.getXMin( this.#offsetToGo + 1 );
        }

        this.#x = x;

        this.#options._setStyle( this.#$slide, {
            "x":        0,
            "xPercent": x
        } );
    }


    moveTo( direction: SlideDirectionType, easing ) {
        let x, positionning, _resolve;

        if (
            !(
                this.willMove( this.#offsetToGo, direction ) ||
                this.willMove( this.#lastOffset, direction )
            )
        ) {
            this.#lastOffset = this.#offsetToGo;
            return Promise.resolve();
        }

        this.#lastOffset = this.#offsetToGo;
        positionning     = this.#offsetToGo === 0 ? 'relative' : 'absolute';
        x                = this.offsetToGo * this.#size;

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
    };


    activate() {
        this.#$slide.setAttribute( 'aria-hidden', "false" );
        this.toggleElementsFocusability( true );
    };


    deactivate() {
        this.#$slide.setAttribute( 'aria-hidden', "true" );
        this.toggleElementsFocusability( false );
    };


    destroy() {
        this.#$slide.removeAttribute( 'aria-hidden' );
        this.#$links.forEach( $link => {
            ( $link as HTMLElement ).removeAttribute( 'tabindex' );
        } );

        this.#options._killTweens( this.#$slide );
        this.#options._setStyle( this.#$slide, {
            "clearProps": "all"
        } );
    };


    getSlideProperties(): SlidePropertiesType {
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
    };
}
