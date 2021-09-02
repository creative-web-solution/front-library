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
    #$slides:       NodeList;
    #$list:         HTMLElement;
    #slidesList:    Slide[];
    #nbSlides:      number;
    #nbPages:       number;
    #currentSlide;
    #STATE_IDLE     = 'idle';
    #STATE_MOVING   = 'moving';
    #state          = this.#STATE_IDLE;
    #EASE_NONE      = Linear.easeNone;
    #options:       SliderOptionsType;


    /**
     * The DOM element of the slider
     */
    get $slider() {
        return this.#$slider;
    }

    /**
     * Wrapper of the slides
     */
    get $list() {
        return this.#$list;
    }

    /**
     * All slides (DOM elements)
     */
    get $slides() {
        return this.#$slides;
    }

    /**
     * All slides (DOM elements)
     */
    get slides() {
        return this.#slidesList.map( slide => slide.getSlideProperties() );
    }

    /**
     * Number of slides
     */
    get slideCount() {
        return this.#nbSlides;
    }

    /**
     * Number of pages (can have several slides by page)
     */
    get pageCount() {
        return this.#nbPages;
    }

    /**
     * Number of bullet needed in a pager
     */
    get bulletCount() {
        return this.#options.moveByPage ? this.#nbPages : this.#nbSlides;
    }


    constructor( $slider, userOptions: SliderOptionsType = {} ) {

        this.#options = extend( defaultOptions, userOptions );

        if ( !this.#options.slidePerPage || this.#options.slidePerPage < 1 ) {
            throw 'SLIDER: There must be at least one slide visible';
        }

        this.#$slider   = $slider;
        this.#$list     = $slider.querySelector( this.#options.listSelector );
        this.#$slides   = this.#$list.querySelectorAll( this.#options.itemsSelector! );
        this.#nbSlides  = this.#$slides.length;

        this.#slidesList = [];
        this.#nbSlides   = this.#$slides.length;
        this.#nbPages    = Math.ceil( this.#nbSlides / this.#options.slidePerPage );


        if ( !this.isEnabled() ) {
            return;
        }

        for ( let index = 0, len = this.#$slides.length; index < len; ++index ) {
            const $slide = this.#$slides[ index ];
            let slide = new Slide( {
                "nbSlideVisibleBefore": this.#options.nbSlideVisibleBefore!,
                "nbSlideVisibleAfter":  this.#options.nbSlideVisibleAfter!,
                "slidePerPage":         this.#options.slidePerPage!,
                "moveByPage":           this.#options.moveByPage!,
                "nbSlides":             this.#nbSlides,
                "nbPages":              this.#nbPages,
                "speed":                this.#options.speed!,
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

        aClass( $slider, this.#options.activeClass! );

        this.init();

        wait().then( () => {
            let data = {
                "currentSlide": this.#currentSlide.getSlideProperties()
            };

            if ( this.#options.onStart ) {
                this.#options.onStart( data );
            }

            /**
             * On the initialization of the slider
             *
             * @event Slider#start
             * @type {Object}
             * @property {SlideEventData_Params} data - Only currentSlide property
             */
            fire( this, {
                "eventsName": SLIDER_EVENT_START,
                "detail": data
            } );
        } );

    }


    private getNextSlideIndex( index: number, step = 1 ): number {
        index = index + step;

        if ( this.#options.loop && index >= this.#nbSlides ) {
            index = 0;
        }
        else if (
            !this.#options.loop && !this.#options.moveByPage && index > this.#nbSlides - this.#options.slidePerPage! ||
            index >= this.#nbSlides
        ) {
            return -1;
        }

        return index;
    }


    private getPreviousSlideIndex( index: number, step = 1 ): number {
        index = index - step;

        if ( index < 0 && this.#options.loop ) {
            if ( step === 1 ) {
                index = this.#nbSlides - 1;
            }
            else {
                index = ( this.#nbPages - 1 ) * this.#options.slidePerPage!;
            }
        }
        else if ( index < 0 ) {
            return -1;
        }

        return index;
    }


    private getNextSlide( index: number, step = 1 ): Slide | undefined {
        index = this.getNextSlideIndex( index, step );

        if ( index < 0 ) {
            return;
        }

        return this.#slidesList[ index ];
    }


    private getPreviousSlide( index: number, step = 1 ): Slide | undefined {
        index = this.getPreviousSlideIndex( index, step );

        if ( index < 0 ) {
            return;
        }

        return this.#slidesList[ index ];
    }


    private reorderSlidesWithLoop( activeSlide: Slide, direction: SlideDirectionType ) {
        let slide, nbSlideAfter, nbSlideBefore;

        slide = activeSlide;

        if ( direction === DIRECTION_NEXT ) {
            nbSlideAfter = Math.floor( ( this.#nbSlides - this.#options.slidePerPage! ) / 2 );
            nbSlideBefore = this.#nbSlides - this.#options.slidePerPage! - nbSlideAfter;
        }
        else {
            nbSlideBefore = Math.floor( ( this.#nbSlides - this.#options.slidePerPage! ) / 2 );
            nbSlideAfter = this.#nbSlides - this.#options.slidePerPage! - nbSlideBefore;
        }

        for ( let indexBefore = 0; indexBefore < nbSlideBefore; ++indexBefore ) {
            slide = this.getPreviousSlide( slide.index );
            slide.setOffsetToGo( -indexBefore - 1 );
        }

        slide = activeSlide;
        slide.setOffsetToGo( 0 );

        for (
            let indexVisible = 1;
            indexVisible < this.#options.slidePerPage!;
            ++indexVisible
        ) {
            slide = this.getNextSlide( slide.index );
            slide.setOffsetToGo( indexVisible );
        }

        for ( let indexAfter = 0; indexAfter < nbSlideAfter; ++indexAfter ) {
            slide = this.getNextSlide( slide.index );
            slide.setOffsetToGo( this.#options.slidePerPage! + indexAfter );
        }
    }


    private reorderSlidesWithoutLoop( activeSlide: Slide ) {
        for ( let i = 0; i < this.#nbSlides; ++i ) {
            let slide = this.#slidesList[ i ];

            if ( i === activeSlide.index ) {
                slide.setOffsetToGo( 0 );
            }
            else if ( i < activeSlide.index - this.#options.nbSlideVisibleBefore! ) {
                slide.setOffsetToGo (-this.#options.nbSlideVisibleBefore! - 1 );
            }
            else if (
                i >
                activeSlide.index +
                    this.#options.nbSlideVisibleAfter +
                    this.#options.slidePerPage
            ) {
                slide.setOffsetToGo(
                    this.#options.nbSlideVisibleAfter! + this.#options.slidePerPage!
                );
            } else {
                slide.setOffsetToGo( i - activeSlide.index );
            }
        }
    }


    private reorderSlides( activeSlide: Slide, direction: SlideDirectionType ) {
        if ( this.#options.loop ) {
            this.reorderSlidesWithLoop( activeSlide, direction );
        }
        else {
            this.reorderSlidesWithoutLoop( activeSlide );
        }
    }


    private moveSlides( nextActiveSlide: Slide, direction: SlideDirectionType, easing, $button: HTMLElement ): Promise<void> {
        let promArray, callbackData;

        this.#state = this.#STATE_MOVING;
        promArray = [];

        callbackData = {
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
         *
         * @event Slider#beforeEach
         * @type {Object}
         * @property {SlideEventData_Params} data
         */
        fire( this, {
            "eventsName": SLIDER_EVENT_BEFORE_EACH,
            "detail": callbackData
        } );


        this.reorderSlides( nextActiveSlide, direction );

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
             *
             * @event Slider#afterEach
             * @type {Object}
             * @property {SlideEventData_Params} data
             */
            fire( this, {
                "eventsName": SLIDER_EVENT_AFTER_EACH,
                "detail": callbackData
            } );

            this.#currentSlide = nextActiveSlide;
        } );
    }


    private init() {
        this.reorderSlides( this.#currentSlide, DIRECTION_NEXT );

        this.#slidesList.forEach( ( slide ) => {
            slide.init();
        } );
    }


    private goPrevious( easing, $button: HTMLElement ): Promise<void> {
        let previousSlide;

        previousSlide = this.getPreviousSlide( this.#currentSlide.index );

        if ( !previousSlide ) {
            return Promise.resolve();
        }

        return this.moveSlides( previousSlide, DIRECTION_PREVIOUS, easing, $button );
    }


    private goNext( easing, $button: HTMLElement ): Promise<void> {
        let nextSlide;

        nextSlide = this.getNextSlide( this.#currentSlide.index );

        if ( !nextSlide ) {
            return Promise.resolve();
        }

        return this.moveSlides( nextSlide, DIRECTION_NEXT, easing, $button );
    }


    private getShortestWayAndDirection( index: number, askedDirection?: SlideDirectionType ) {
        let setupOpt, indexOfFirstPage, indexOfLastPage, currentPageIndex;

        setupOpt         = {};
        indexOfFirstPage = 0;
        indexOfLastPage  = this.#nbSlides - 1;
        currentPageIndex = this.#currentSlide.index;

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


    private updateHeight( currentSlide: Slide, nextSlide: Slide, duration: number ): Promise<void> {
        return new Promise( resolve => {
            this.#options._tweenFromTo!(
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


    private cleanListHeight() {
        this.#options._setStyle!( this.#$list, {
            "clearProps": "height"
        } );
    }


    private moveTo( index: number, askedDirection?: SlideDirectionType, $button?: HTMLElement ): Promise<void> {
        let wayAndDirection,
            prom,
            fun,
            easing,
            lastCurrentSlide,
            nextSlide,
            promArray,
            callbackData;

        if (
            this.#state !== this.#STATE_IDLE ||
            index === this.#currentSlide.index ||
            index < 0 ||
            index >= this.#nbSlides
        ) {
            return Promise.resolve();
        }

        nextSlide = this.#slidesList[ index ];
        promArray = [];

        wayAndDirection = this.getShortestWayAndDirection( index, askedDirection );
        fun =
            wayAndDirection.direction === DIRECTION_PREVIOUS
                ? this.goPrevious.bind( this )
                : this.goNext.bind( this );

        easing = this.#EASE_NONE;
        lastCurrentSlide = this.#currentSlide;

        callbackData = {
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
                this.updateHeight(
                    this.#currentSlide,
                    nextSlide,
                    this.#options.speed! * wayAndDirection.nbStepsMin
                )
            );
        }

        promArray.push( prom );

        return Promise.all( promArray ).then(() => {
            if ( this.#options.smoothHeight ) {
                this.cleanListHeight();
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
        let nextSlideIndex;

        if ( this.#state !== this.#STATE_IDLE || ( !this.#options.loop && this.#currentSlide.isLast ) ) {
            return Promise.resolve();
        }

        nextSlideIndex = this.getNextSlideIndex(
            this.#currentSlide.index,
            this.#options.moveByPage ? this.#options.slidePerPage : 1
        );

        if ( nextSlideIndex < 0 ) {
            return Promise.resolve();
        }

        return this.moveTo( nextSlideIndex, DIRECTION_NEXT, $button );
    }


    /**
     * Go to the previous slide or page
     * @param $button Internal use only
     */
    previous( $button?: HTMLElement ): Promise<void> {
        let previousSlideIndex;

        if ( this.#state !== this.#STATE_IDLE || ( !this.#options.loop && this.#currentSlide.isFirst ) ) {
            return Promise.resolve();
        }

        previousSlideIndex = this.getPreviousSlideIndex(
            this.#currentSlide.index,
            this.#options.moveByPage ? this.#options.slidePerPage : 1
        );

        if ( previousSlideIndex < 0 ) {
            return Promise.resolve();
        }

        return this.moveTo( previousSlideIndex, DIRECTION_PREVIOUS, $button );
    }


    /**
     * Go to the asked slide or page
     *
     * @param page
     * @param $button Internal use only
     */
    goTo( page: number, $button?: HTMLElement ): Promise<void> {
        let index = this.#options.moveByPage ? page * this.#options.slidePerPage! : page;

        return this.moveTo( index, undefined, $button );
    }


    /**
     * Check if the slider is enable or not
     */
    isEnabled(): boolean {
        let nbSlidesVisible =
            this.#options.nbSlideVisibleBefore! +
            this.#options.nbSlideVisibleAfter! +
            this.#options.slidePerPage!;
        return (
            this.#nbSlides > nbSlidesVisible ||
            ( !this.#options.loop && this.#nbSlides === nbSlidesVisible )
        );
    }


    /**
     * Remove all events, css class or inline styles
     */
    destroy() {
        if ( this.isEnabled() ) {
            this.#slidesList.forEach( slide => {
                slide.destroy();
            } );
            rClass( this.#$slider, this.#options.activeClass! );
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
     *
     * @param index
     */
    getSlide( index ): Slide {
        return this.#slidesList[ index ];
    }


    /**
     * Get the nbth slide after the index
     *
     * @param index - target index
     * @param nb - Number of slide after the target
     */
    getTheNthChildAfter( index: number, nb: number ): Slide | undefined {
        return this.getNextSlide( index, nb );
    }


    /**
     * Get the nbth slide before the index
     *
     * @param index - target index
     * @param nb - Number of slide before the target
     */
    getTheNthChildBefore( index: number, nb: number ): Slide | undefined {
        return this.getPreviousSlide( index, nb );
    }
}
