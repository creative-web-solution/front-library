import { fire }           from '../../Events/EventsManager';
import { extend }         from '../../Helpers/Extend';
import { wait }           from '../../Helpers/Wait';
import { aClass, rClass } from '../../DOM/Class';
import { Slide }          from './Slide';


const DIRECTION_NEXT           = 1;
const DIRECTION_PREVIOUS       = -1;

const SLIDER_EVENT_BEFORE      = 'before';
const SLIDER_EVENT_BEFORE_EACH = 'beforeEach';
const SLIDER_EVENT_AFTER       = 'after';
const SLIDER_EVENT_AFTER_EACH  = 'afterEach';
const SLIDER_EVENT_START       = 'start';


const defaultOptions = {
    "startSlide":           0,
    "nbSlideVisibleBefore": 0,
    "nbSlideVisibleAfter":  0,
    "slidePerPage":         1,
    "moveByPage":           true,
    "speed":                0.5,
    "smoothHeight":         true,
    "listSelector":         ".list",
    "itemsSelector":        ".item",
    "activeClass":          "active-slide",
    "loop":                 true,
    "_setStyle": ( $elem, styles ) => {
        gsap.set( $elem, styles );
    },
    "_tweenTo": ( $elem, styles ) => {
        gsap.to( $elem, styles );
    },
    "_tweenFromTo": ( $elem, init, styles ) => {
        gsap.fromTo( $elem, init, styles );
    },
    "_killTweens": ( $elem ) => {
        gsap.killTweensOf( $elem );
    }
};


/**
 * Slider
 *
 * @see extra/modules/slider.md
 *
 * @example
 * let slider = new Slider( $slider, options );
 * promise = slider.previous();
 */
export default class Slider {

    #$slider:       HTMLElement;
    #$slides:       NodeListOf<HTMLElement>;
    #$list:         HTMLElement;
    #slidesList:    Slide[];
    #nbSlides:      number;
    #nbPages:       number;
    #currentSlide;
    #STATE_IDLE     = 'idle';
    #STATE_MOVING   = 'moving';
    #state          = this.#STATE_IDLE;
    #EASE_NONE      = Linear.easeNone;
    #options:       FLib.Slider.Options;


    /**
     * The DOM element of the slider
     */
    get $slider(): HTMLElement {
        return this.#$slider;
    }

    /**
     * Wrapper of the slides
     */
    get $list(): HTMLElement {
        return this.#$list;
    }

    /**
     * All slides (DOM elements)
     */
    get $slides(): NodeListOf<HTMLElement> {
        return this.#$slides;
    }

    /**
     * All slides (DOM elements)
     */
    get slides(): any[] {
        return this.#slidesList.map( slide => slide.getSlideProperties() );
    }

    /**
     * Number of slides
     */
    get slideCount(): number {
        return this.#nbSlides;
    }

    /**
     * Number of pages (can have several slides by page)
     */
    get pageCount(): number {
        return this.#nbPages;
    }

    /**
     * Number of bullet needed in a pager
     */
    get bulletCount(): number {
        return this.#options.moveByPage ? this.#nbPages : this.#nbSlides;
    }


    constructor( $slider: HTMLElement, userOptions: Partial<FLib.Slider.Options> = {} ) {

        this.#options = extend( defaultOptions, userOptions );

        if ( !this.#options.slidePerPage || this.#options.slidePerPage < 1 ) {
            throw 'SLIDER: There must be at least one slide visible';
        }

        this.#$slider   = $slider;
        this.#$list     = $slider.querySelector( this.#options.listSelector ) as HTMLElement;
        this.#$slides   = this.#$list.querySelectorAll( this.#options.itemsSelector );
        this.#nbSlides  = this.#$slides.length;

        this.#slidesList = [];
        this.#nbSlides   = this.#$slides.length;
        this.#nbPages    = Math.ceil( this.#nbSlides / this.#options.slidePerPage );


        if ( !this.isEnabled() ) {
            return;
        }

        for ( let index = 0, len = this.#$slides.length; index < len; ++index ) {
            const $slide = this.#$slides[ index ];
            const slide = new Slide( {
                "nbSlideVisibleBefore": this.#options.nbSlideVisibleBefore,
                "nbSlideVisibleAfter":  this.#options.nbSlideVisibleAfter,
                "slidePerPage":         this.#options.slidePerPage,
                "moveByPage":           this.#options.moveByPage,
                "nbSlides":             this.#nbSlides,
                "nbPages":              this.#nbPages,
                "speed":                this.#options.speed,
                "$slide":               $slide as HTMLElement,
                index,
                "_setStyle":            this.#options._setStyle,
                "_tweenTo":             this.#options._tweenTo,
                "_tweenFromTo":         this.#options._tweenFromTo,
                "_killTweens":          this.#options._killTweens
            } );

            if ( slide.index === this.#options.startSlide ) {
                this.#currentSlide = slide;
            }

            this.#slidesList.push( slide );
        }

        aClass( $slider, this.#options.activeClass );

        this.#init();

        wait().then( () => {
            const data = {
                "currentSlide": this.#currentSlide.getSlideProperties()
            };

            if ( this.#options.onStart ) {
                this.#options.onStart( data );
            }

            fire( this, {
                "eventsName": SLIDER_EVENT_START,
                "detail": data
            } );
        } );

    }


    #getNextSlideIndex = ( index: number, step = 1 ): number => {
        index = index + step;

        if ( this.#options.loop && index >= this.#nbSlides ) {
            index = 0;
        }
        else if (
            !this.#options.loop && !this.#options.moveByPage && index > this.#nbSlides - this.#options.slidePerPage ||
            index >= this.#nbSlides
        ) {
            return -1;
        }

        return index;
    }


    #getPreviousSlideIndex = ( index: number, step = 1 ): number => {
        index = index - step;

        if ( index < 0 && this.#options.loop ) {
            if ( step === 1 ) {
                index = this.#nbSlides - 1;
            }
            else {
                index = ( this.#nbPages - 1 ) * this.#options.slidePerPage;
            }
        }
        else if ( index < 0 ) {
            return -1;
        }

        return index;
    }


    #getNextSlide = ( index: number, step = 1 ): Slide | undefined => {
        index = this.#getNextSlideIndex( index, step );

        if ( index < 0 ) {
            return;
        }

        return this.#slidesList[ index ];
    }


    #getPreviousSlide = ( index: number, step = 1 ): Slide | undefined => {
        index = this.#getPreviousSlideIndex( index, step );

        if ( index < 0 ) {
            return;
        }

        return this.#slidesList[ index ];
    }


    #reorderSlidesWithLoop = ( activeSlide: Slide, direction: FLib.Slider.SlideDirection ): void => {
        let slide, nbSlideAfter, nbSlideBefore;

        slide = activeSlide;

        if ( direction === DIRECTION_NEXT ) {
            nbSlideAfter = Math.floor( ( this.#nbSlides - this.#options.slidePerPage ) / 2 );
            nbSlideBefore = this.#nbSlides - this.#options.slidePerPage - nbSlideAfter;
        }
        else {
            nbSlideBefore = Math.floor( ( this.#nbSlides - this.#options.slidePerPage ) / 2 );
            nbSlideAfter = this.#nbSlides - this.#options.slidePerPage - nbSlideBefore;
        }

        for ( let indexBefore = 0; indexBefore < nbSlideBefore; ++indexBefore ) {
            slide = this.#getPreviousSlide( slide.index );
            slide.setOffsetToGo( -indexBefore - 1 );
        }

        slide = activeSlide;
        slide.setOffsetToGo( 0 );

        for (
            let indexVisible = 1;
            indexVisible < this.#options.slidePerPage;
            ++indexVisible
        ) {
            slide = this.#getNextSlide( slide.index );
            slide.setOffsetToGo( indexVisible );
        }

        for ( let indexAfter = 0; indexAfter < nbSlideAfter; ++indexAfter ) {
            slide = this.#getNextSlide( slide.index );
            slide.setOffsetToGo( this.#options.slidePerPage + indexAfter );
        }
    }


    #reorderSlidesWithoutLoop = ( activeSlide: Slide ): void => {
        for ( let i = 0; i < this.#nbSlides; ++i ) {
            const slide = this.#slidesList[ i ];

            if ( i === activeSlide.index ) {
                slide.setOffsetToGo( 0 );
            }
            else if ( i < activeSlide.index - this.#options.nbSlideVisibleBefore ) {
                slide.setOffsetToGo (-this.#options.nbSlideVisibleBefore - 1 );
            }
            else if (
                i >
                activeSlide.index +
                    this.#options.nbSlideVisibleAfter +
                    this.#options.slidePerPage
            ) {
                slide.setOffsetToGo(
                    this.#options.nbSlideVisibleAfter + this.#options.slidePerPage
                );
            } else {
                slide.setOffsetToGo( i - activeSlide.index );
            }
        }
    }


    #reorderSlides = ( activeSlide: Slide, direction: FLib.Slider.SlideDirection ): void => {
        if ( this.#options.loop ) {
            this.#reorderSlidesWithLoop( activeSlide, direction );
        }
        else {
            this.#reorderSlidesWithoutLoop( activeSlide );
        }
    }


    #moveSlides = ( nextActiveSlide: Slide, direction: FLib.Slider.SlideDirection, easing, $button?: HTMLElement ): Promise<void> => {
        this.#state = this.#STATE_MOVING;
        const promArray: Promise<any>[] = [];

        const callbackData: FLib.Slider.CallbackParam = {
            "targetSlide":  nextActiveSlide.getSlideProperties(),
            "currentSlide": this.#currentSlide.getSlideProperties(),
            "direction":    direction
        };

        if ( $button ) {
            callbackData.$button = $button;
        }

        if ( this.#options.onBeforeEach ) {
            this.#options.onBeforeEach( callbackData );
        }


        /**
         * Before each slide move. If moving for 3 slides, it will be called 3 times.
         */
        fire( this, {
            "eventsName": SLIDER_EVENT_BEFORE_EACH,
            "detail": callbackData
        } );


        this.#reorderSlides( nextActiveSlide, direction );

        // All init first
        this.#slidesList.forEach( slide => {
            slide.initMoveTo( direction );
        } );

        // All move only after all init are done
        this.#slidesList.forEach( slide => {
            promArray.push( slide.moveTo( direction, easing ) );
        } );

        return Promise.all( promArray ).then( () => {
            if ( this.#options.onAfterEach ) {
                this.#options.onAfterEach( callbackData );
            }

            /**
             * After each slide move. If moving for 3 slides, it will be called 3 times.
             */
            fire( this, {
                "eventsName": SLIDER_EVENT_AFTER_EACH,
                "detail": callbackData
            } );

            this.#currentSlide = nextActiveSlide;
        } );
    }


    #init = (): void => {
        this.#reorderSlides( this.#currentSlide, DIRECTION_NEXT );

        this.#slidesList.forEach( ( slide ) => {
            slide.init();
        } );
    }


    #goPrevious = ( easing, $button?: HTMLElement ): Promise<void> => {
        const previousSlide = this.#getPreviousSlide( this.#currentSlide.index );

        if ( !previousSlide ) {
            return Promise.resolve();
        }

        return this.#moveSlides( previousSlide, DIRECTION_PREVIOUS, easing, $button );
    }


    #goNext = ( easing, $button?: HTMLElement ): Promise<void> => {
        const nextSlide = this.#getNextSlide( this.#currentSlide.index );

        if ( !nextSlide ) {
            return Promise.resolve();
        }

        return this.#moveSlides( nextSlide, DIRECTION_NEXT, easing, $button );
    }


    #getShortestWayAndDirection = ( index: number, askedDirection?: FLib.Slider.SlideDirection ): Record<string, any> => {
        const setupOpt:        Record<string, any> = {};
        const indexOfFirstPage = 0;
        const indexOfLastPage  = this.#nbSlides - 1;
        const currentPageIndex = this.#currentSlide.index;

        // Store the natural direction
        setupOpt.direction =
            this.#currentSlide.index > index ? DIRECTION_PREVIOUS : DIRECTION_NEXT;
        setupOpt.nbStepsStraight = Math.abs( currentPageIndex - index );

        if ( !this.#options.loop ) {
            setupOpt.nbStepsMin = setupOpt.nbStepsViaStart = setupOpt.nbStepsViaEnd =
                setupOpt.nbStepsStraight;
            setupOpt.straightMove = true;
            setupOpt.viaStartMove = setupOpt.viaEndMove = false;
            return setupOpt;
        }

        setupOpt.nbStepsViaStart = Math.abs(
            currentPageIndex - indexOfFirstPage + indexOfLastPage - index + 1
        );
        setupOpt.nbStepsViaEnd = Math.abs(
            indexOfLastPage - currentPageIndex + index - indexOfFirstPage + 1
        );

        if ( askedDirection === DIRECTION_PREVIOUS ) {
            setupOpt.viaStartMove = true;
            setupOpt.straightMove = setupOpt.direction === DIRECTION_PREVIOUS;
            setupOpt.viaEndMove = false;
            setupOpt.direction = DIRECTION_PREVIOUS;

            setupOpt.nbStepsMin = setupOpt.straightMove ? setupOpt.nbStepsStraight : setupOpt.nbStepsViaStart;
        }
        else if ( askedDirection === DIRECTION_NEXT ) {
            setupOpt.viaEndMove = true;
            setupOpt.straightMove = setupOpt.direction === DIRECTION_NEXT;
            setupOpt.viaStartMove = false;
            setupOpt.direction = DIRECTION_NEXT;

            setupOpt.nbStepsMin = setupOpt.straightMove ? setupOpt.nbStepsStraight : setupOpt.nbStepsViaEnd;
        }
        else {
            setupOpt.nbStepsMin = Math.min(
                setupOpt.nbStepsStraight,
                setupOpt.nbStepsViaStart,
                setupOpt.nbStepsViaEnd
            );

            setupOpt.straightMove =
                setupOpt.nbStepsMin === setupOpt.nbStepsStraight;
            setupOpt.viaStartMove =
                !setupOpt.straightMove &&
                setupOpt.nbStepsMin === setupOpt.nbStepsViaStart;
            setupOpt.viaEndMove =
                !setupOpt.straightMove &&
                setupOpt.nbStepsMin === setupOpt.nbStepsViaEnd;

            if ( setupOpt.viaStartMove && setupOpt.viaEndMove ) {
                // Use the natural direction
                setupOpt.viaStartMove = setupOpt.direction === DIRECTION_PREVIOUS;
                setupOpt.viaEndMove = !setupOpt.viaStartMove;
            }
            else if ( setupOpt.viaStartMove ) {
                setupOpt.direction = DIRECTION_PREVIOUS;
            }
            else if ( setupOpt.viaEndMove ) {
                setupOpt.direction = DIRECTION_NEXT;
            }
        }

        return setupOpt;
    }


    #updateHeight = ( currentSlide: Slide, nextSlide: Slide, duration: number ): Promise<void> => {
        return new Promise( resolve => {
            this.#options._tweenFromTo(
                this.#$list,
                {
                    "height": currentSlide.getHeight()
                },
                {
                    duration,
                    "height": nextSlide.getHeight(),
                    "onComplete": resolve
                }
            );
        } );
    }


    #cleanListHeight = (): void => {
        this.#options._setStyle( this.#$list, {
            "clearProps": "height"
        } );
    }


    #moveTo = ( index: number, askedDirection?: FLib.Slider.SlideDirection, $button?: HTMLElement ): Promise<void> => {
        let prom;

        if (
            this.#state !== this.#STATE_IDLE ||
            index === this.#currentSlide.index ||
            index < 0 ||
            index >= this.#nbSlides
        ) {
            return Promise.resolve();
        }

        const nextSlide = this.#slidesList[ index ];
        const promArray: Promise<any>[] = [];

        const wayAndDirection = this.#getShortestWayAndDirection( index, askedDirection );
        const fun =
            wayAndDirection.direction === DIRECTION_PREVIOUS
                ? this.#goPrevious.bind( this )
                : this.#goNext.bind( this );

        const easing = this.#EASE_NONE;
        const lastCurrentSlide = this.#currentSlide;

        const callbackData: FLib.Slider.CallbackParam = {
            "targetSlide": nextSlide.getSlideProperties(),
            "currentSlide": lastCurrentSlide.getSlideProperties(),
            "direction": wayAndDirection.direction
        };

        if ( $button ) {
            callbackData.$button = $button;
        }

        if ( this.#options.onBefore ) {
            this.#options.onBefore( callbackData );
        }

        fire( this, {
            "eventsName": SLIDER_EVENT_BEFORE,
            "detail": callbackData
        } );

        for ( let i = 0; i < wayAndDirection.nbStepsMin; ++i ) {
            if ( !prom ) {
                prom = fun( easing, $button );
            }
            else {
                prom = prom.then(
                    ( ea => {
                        return () => {
                            return fun( ea, $button );
                        };
                    } )( easing )
                );
            }
        }

        if ( this.#options.smoothHeight ) {
            promArray.push(
                this.#updateHeight(
                    this.#currentSlide,
                    nextSlide,
                    this.#options.speed * wayAndDirection.nbStepsMin
                )
            );
        }

        promArray.push( prom );

        return Promise.all( promArray ).then(() => {
            if ( this.#options.smoothHeight ) {
                this.#cleanListHeight();
            }

            if ( this.#options.onAfter ) {
                this.#options.onAfter( callbackData );
            }

            fire( this, {
                "eventsName": SLIDER_EVENT_AFTER,
                "detail": callbackData
            } );

            this.#state = this.#STATE_IDLE;
        } );
    }


    /**
     * Go to the next slide or page
     *
     * @param $button - Internal use only
     */
    next( $button?: HTMLElement ) : Promise<void>{
        if ( this.#state !== this.#STATE_IDLE || ( !this.#options.loop && this.#currentSlide.isLast ) ) {
            return Promise.resolve();
        }

        const nextSlideIndex = this.#getNextSlideIndex(
            this.#currentSlide.index,
            this.#options.moveByPage ? this.#options.slidePerPage : 1
        );

        if ( nextSlideIndex < 0 ) {
            return Promise.resolve();
        }

        return this.#moveTo( nextSlideIndex, DIRECTION_NEXT, $button );
    }


    /**
     * Go to the previous slide or page
     *
     * @param $button - Internal use only
     */
    previous( $button?: HTMLElement ): Promise<void> {
        if ( this.#state !== this.#STATE_IDLE || ( !this.#options.loop && this.#currentSlide.isFirst ) ) {
            return Promise.resolve();
        }

        const previousSlideIndex = this.#getPreviousSlideIndex(
            this.#currentSlide.index,
            this.#options.moveByPage ? this.#options.slidePerPage : 1
        );

        if ( previousSlideIndex < 0 ) {
            return Promise.resolve();
        }

        return this.#moveTo( previousSlideIndex, DIRECTION_PREVIOUS, $button );
    }


    /**
     * Go to the asked slide or page
     *
     * @param $button - Internal use only
     */
    goTo( page: number, $button?: HTMLElement ): Promise<void> {
        const index = this.#options.moveByPage ? page * this.#options.slidePerPage : page;

        return this.#moveTo( index, undefined, $button );
    }


    /**
     * Check if the slider is enable or not
     */
    isEnabled(): boolean {
        const nbSlidesVisible =
            this.#options.nbSlideVisibleBefore +
            this.#options.nbSlideVisibleAfter +
            this.#options.slidePerPage;
        return (
            this.#nbSlides > nbSlidesVisible ||
            ( !this.#options.loop && this.#nbSlides === nbSlidesVisible )
        );
    }


    /**
     * Remove all events, css class or inline styles
     */
    destroy(): void {
        if ( this.isEnabled() ) {
            this.#slidesList.forEach( slide => {
                slide.destroy();
            } );
            rClass( this.#$slider, this.#options.activeClass );
        }
    }


    /**
     * Get the current active slide
     */
    getCurrentSlide(): Slide {
        return this.#currentSlide;
    }


    /**
     * Get a slide in function of an index
     */
    getSlide( index: number ): Slide {
        return this.#slidesList[ index ];
    }


    /**
     * Get the nbth slide after the index
     *
     * @param index - target index
     * @param nb - Number of slide after the target
     */
    getTheNthChildAfter( index: number, nb: number ): Slide | undefined {
        return this.#getNextSlide( index, nb );
    }


    /**
     * Get the nbth slide before the index
     *
     * @param index - target index
     * @param nb - Number of slide before the target
     */
    getTheNthChildBefore( index: number, nb: number ): Slide | undefined {
        return this.#getPreviousSlide( index, nb );
    }
}
