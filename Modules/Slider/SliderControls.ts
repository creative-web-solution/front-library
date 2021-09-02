import { on, one }                  from '../../Events/EventsManager';
import { gesture, gestureOff }      from '../../Events/Gesture';
import KeyboardHandler              from '../../Events/KeyboardHandler';
import { extend }                   from '../../Helpers/Extend';
import { index }                    from '../../DOM/Index';
import Slider                       from './Slider';
import { Slide }                    from './Slide';


/**
 * Controls of a slider
 *
 * @see extra/modules/slider.md
 *
 * @example
 * let controls = new SliderControls(
 *  slider,
 *  {
 *      "$btPrev": $previousButtton,
 *      "$btNext": $nextButton,
 *      "$pagination": $pagination,
 *      "paginationItemsSelector": '.item',
 *      "autoslide": 10, // in second
 *      "swipe": false,
 *      "enableKeyboard": true,
 *      "gestureOptions": Object
 *  }
 * );
*/
export default class SliderControls {

    #slider:                        Slider;
    #autoslideTimeoutId;
    #keyboardPreviousButton;
    #keyboardNextButton;
    #$bullets:                      NodeList | null = null;
    #paginationKeyboardControls;
    #inSlideKeyboardControls;
    #isAutoslideEnabled:            boolean = false;
    #options:                       SliderControlsOptionsType;


    /**
     * Controlled slider
     */
    get slider() {
        return this.#slider;
    }


    constructor( slider, options: SliderControlsOptionsType ) {
        this.#slider  = slider;
        this.#options = options;


        if ( options.$pagination && options.paginationItemsSelector ) {
            this.#$bullets = options.$pagination.querySelectorAll( options.paginationItemsSelector );
        }


        // ------------------- INIT DOM


        on( slider, {
            "eventsName": "before",
            "callback": data => {
                this.updateBullets( data.targetSlide, data.currentSlide );
            }
        } );

        on( slider, {
            "eventsName": "start",
            "callback": data => {
                this.updateBullets( data.currentSlide );
            }
        } );

        if ( options.$pagination ) {
            options.$pagination.setAttribute( 'role', 'tablist' );
        }

        if ( this.#$bullets ) {
            this.#$bullets.forEach( ( $bullet, index ) => {
                let matchSlide = slider.getSlide( index );

                ($bullet as HTMLElement).setAttribute( 'role', 'tab' );
                ($bullet as HTMLElement).setAttribute( 'aria-selected', 'false' );
                ($bullet as HTMLElement).setAttribute( 'tabindex', '-1' );
                ($bullet as HTMLElement).setAttribute( 'aria-controls', matchSlide.id );
            } );
        }

        // ------------------- BIND GESTURES

        if ( options.$btPrev ) {
            gesture( options.$btPrev, '__sliderBtPrev', {
                "tap": this.onPrev.bind( this ),
            } );
        }

        if ( options.$btNext ) {
            gesture( options.$btNext, '__sliderBtNext', {
                "tap": this.onNext.bind( this ),
            } );
        }

        if ( this.#$bullets ) {
            gesture( options.$pagination!, '__sliderBtPagination', {
                "selector": options.paginationItemsSelector,
                "tap": this.onPager.bind( this ),
            } );
        }

        if ( options.swipe ) {
            let gestureOptions = {
                "preventStart": true,
                "swipeLeft": () => {
                    this.next();
                },
                "swipeRight": () => {
                    this.previous();
                }
            };

            if ( options.gestureOptions ) {
                gestureOptions = extend(
                    gestureOptions,
                    options.gestureOptions
                );

                if ( options.gestureOptions.swipeLeft ) {
                    gestureOptions = extend(
                        gestureOptions,
                        {
                            "swipeLeft": ( e: Event, $target: HTMLElement, type: string ) => {
                                this.next();
                                if ( options.gestureOptions!.swipeLeft ) {
                                    options.gestureOptions!.swipeLeft.call( this, e, $target, type  );
                                }
                            }
                        }
                    );
                }

                if ( options.gestureOptions.swipeRight ) {
                    gestureOptions = extend(
                        gestureOptions,
                        {
                            "swipeRight": ( e: Event, $target: HTMLElement, type: string ) => {
                                this.previous();
                                if ( options.gestureOptions!.swipeRight ) {
                                    options.gestureOptions!.swipeRight.call( this, e, $target, type );
                                }
                            }
                        }
                    );
                }
            }

            gesture( slider.$slider, '__sliderSwipe', gestureOptions );
        }

        // ------------------- BIND KEYBOARD

        if ( options.enableKeyboard ) {
            this.#inSlideKeyboardControls = new KeyboardHandler(
                slider.$list,
                {
                    "onUp": e => {
                        if ( e.ctrlKey ) {
                            this.updateBulletsFocus();
                        }
                    },
                    "onPageUp": e => {
                        if (e.ctrlKey) {
                            one(slider, {
                                "eventsName": "before",
                                "callback": this.updateBulletsFocus
                            });
                            slider.previous();
                        }
                    },
                    "onPageDown": e => {
                        if (e.ctrlKey) {
                            one(slider, {
                                "eventsName": "before",
                                "callback": this.updateBulletsFocus
                            });
                            slider.next();
                        }
                    },
                }
            );

            // ARROW KEY on bullets pagination

            if (options.$pagination) {
                this.#paginationKeyboardControls = new KeyboardHandler(
                    options.$pagination,
                    {
                        "selector": options.paginationItemsSelector,
                        "onPrevious": () => {
                            one( slider, {
                                "eventsName": "before",
                                "callback": this.updateBulletsFocus
                            } );
                            slider.previous();
                        },
                        "onNext": () => {
                            one( slider, {
                                "eventsName": "before",
                                "callback": this.updateBulletsFocus
                            } );
                            slider.next();
                        },
                    }
                );
            }

            // SPACE and ENTER on buttons previous and next

            if ( options.$btNext ) {
                this.#keyboardNextButton = new KeyboardHandler(
                    options.$btNext,
                    {
                        "onSelect": this.onNext.bind( this ),
                    }
                );
            }

            if ( options.$btPrev ) {
                this.#keyboardPreviousButton = new KeyboardHandler(
                    options.$btPrev,
                    {
                        "onSelect": this.onPrev.bind( this ),
                    }
                );
            }
        }

        // ------------------- START AUTOSLIDE

        this.startAutoslide();
    }


    /**
     * Go to the next slide or page
     *
     * @param _$button - Internal use
     */
    next( _$button?: HTMLElement ): Promise<void> {
        this._stopAutoslide();
        return this.#slider.next( _$button );
    };


    /**
     * Go to the previous slide or page
     *
     * @param _$button - Internal use
     */
    previous( _$button?: HTMLElement ): Promise<void> {
        this._stopAutoslide();
        return this.#slider.previous( _$button );
    };


    /**
     * Go to the asked slide or page
     *
     * @param index
     * @param $button - Internal use
     */
    goTo( index: number, _$button?: HTMLElement ): Promise<void> {
        this._stopAutoslide();
        return this.#slider.goTo( index, _$button );
    };


    /**
     * Check if the slider is enable or not
     */
    isEnabled(): boolean {
        return this.#slider.isEnabled();
    };


    /**
     * Destroy the slider and its controls
     */
    destroy() {
        clearTimeout( this.#autoslideTimeoutId );
        this.#slider.destroy();

        if ( this.#options.$btPrev ) {
            gestureOff( this.#options.$btPrev, '__sliderBtPrev' );
        }

        if ( this.#options.$btNext ) {
            gestureOff( this.#options.$btNext, '__sliderBtNext' );
        }

        if ( this.#keyboardPreviousButton ) {
            this.#keyboardPreviousButton.off();
        }

        if ( this.#keyboardNextButton ) {
            this.#keyboardNextButton.off();
        }

        if ( this.#paginationKeyboardControls ) {
            this.#paginationKeyboardControls.off();
        }

        if ( this.#inSlideKeyboardControls ) {
            this.#inSlideKeyboardControls.off();
        }

        if ( this.#$bullets ) {
            gestureOff( this.#options.$pagination!, '__sliderBtPagination' );
        }

        if ( this.#options.swipe ) {
            gestureOff( this.#slider.$slider, '__sliderSwipe' );
        }
    };


    /**
     * Start the autoslide
     */
    startAutoslide() {
        if ( this.#options.autoslide ) {
            this.#isAutoslideEnabled = true;
            this.autoslideLoop();
        }
    };


    /**
     * Stop the autoslide
     */
    stopAutoslide() {
        this._stopAutoslide();
    };


    public onPrev( e, $target: HTMLElement ) {
        e.preventDefault();

        this.previous( $target );
    }


    private onNext( e, $target: HTMLElement ) {
        e.preventDefault();

        this.next( $target );
    }


    private onPager( e, $target: HTMLElement ) {
        e.preventDefault();

        this.goTo( index( $target ), $target );
    }


    private _stopAutoslide() {
        clearTimeout( this.#autoslideTimeoutId );
        this.#isAutoslideEnabled = false;
    }


    private makeAutoslide() {
        this.#slider.next().then( () => {
            if ( this.#isAutoslideEnabled ) {
                this.autoslideLoop();
            }
        } );
    }


    private autoslideLoop() {
        const currentSlide = this.#slider.getCurrentSlide();

        clearTimeout( this.#autoslideTimeoutId );

        this.#autoslideTimeoutId = setTimeout(
            this.makeAutoslide,
            ( currentSlide.delay as number || this.#options.autoslide! as number ) * 1000
        );
    }


    private updateBullets( targetSlide: Slide, currentSlide?: Slide ) {
        if ( !this.#$bullets ) {
            return;
        }

        if ( currentSlide && this.#$bullets[ currentSlide.index ] ) {
            const $BULLET = this.#$bullets[ currentSlide.index ] as HTMLElement;
            $BULLET.setAttribute( 'aria-selected', 'false' );
            $BULLET.setAttribute( 'tabindex', '-1' );
        }

        if ( targetSlide && this.#$bullets[ targetSlide.index ] ) {
            const $BULLET = this.#$bullets[ targetSlide.index ] as HTMLElement;
            $BULLET.setAttribute( 'aria-selected', 'true' );
            $BULLET.setAttribute( 'tabindex', '0' );
        }
    }


    private updateBulletsFocus( data? ) {
        const currentSlide = data ? data.targetSlide : this.#slider.getCurrentSlide();

        if ( this.#$bullets && this.#$bullets[ currentSlide.index ] ) {
            (this.#$bullets[ currentSlide.index ] as HTMLElement).focus();
        }
        else if (
            this.#options.$pagination &&
            parseInt( this.#options.$pagination.getAttribute( 'tabindex' ) || '-1', 10 ) > -1
        ) {
            this.#options.$pagination.focus();
        }
    }

}