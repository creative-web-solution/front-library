/*dependencies: helpers::extend,helpers::wait,helpers::defer,dom::outer-size,dom::class,events::keyboard-handler,events::gesture,events::event-manager */

import { on, one, off, fire } from 'front-library/events/event-manager';
import { gesture, gestureOff } from 'front-library/events/gesture';
import { KeyboardHandler } from 'front-library/events/keyboard-handler';
import { extend } from 'front-library/helpers/extend';
import { defer } from 'front-library/helpers/defer';
import { wait } from 'front-library/helpers/wait';
import { index } from 'front-library/dom/index';
import { outerHeight } from 'front-library/dom/outer-size';
import { aClass, rClass } from 'front-library/dom/class';


/**
 * @typedef {object} Slide
 * @memberof Slider
 * @property {HTMLElement} $slide
 * @property {string} id
 * @property {number} delay - In seconds
 * @property {number} index
 * @property {number} position - (= index + 1)
 * @property {boolean} isFirst
 * @property {boolean} isLast
 * @property {boolean} isVisible
 * @property {boolean} isActive
 */
/**
 * @typedef {object} SlideEventData_Params
 * @memberof Slider
 * @property {Slide} targetSlide
 * @property {Slide} currentSlide
 * @property {number} direction - 1 = next, -1 = previous
 */
/**
 * Slider
 * @class Slider
 *
 * @param {HTMLElement} $slider
 * @param {Object} [userOptions]
 * @param {number} [userOptions.startSlide=0]
 * @param {number} [userOptions.nbSlideVisibleBefore=0]
 * @param {number} [userOptions.nbSlideVisibleAfter=0]
 * @param {number} [userOptions.slidePerPage=1]
 * @param {boolean} [userOptions.moveByPage=true]
 * @param {number} [userOptions.speed=0.5] - In second
 * @param {string} [userOptions.listSelector=.list]
 * @param {string} [userOptions.itemsSelector=.item]
 * @param {string} [userOptions.activeClass=active-slide]
 * @param {boolean} [userOptions.loop=true]
 * @param {boolean} [userOptions.smoothHeight=true]
 * @param {Callback} [userOptions.onBefore=data => {}] - Called one time at the begining of the animation
 * @param {Callback} [userOptions.onBeforeEach=data => {}] - Called for every slide that will come in the 1st position during the animation
 * @param {Callback} [userOptions.onAfter=data => {}] - Called one time at the end of the animation
 * @param {Callback} [userOptions.onAfterEach=data => {}] - Called for every slide that is came in the 1st position during the animation
 * @param {Callback} [userOptions.onStart=data => {}] - Called one time at the initialisation of the slider
 *
 * @see extra/modules/slider.md
 *
 * @example let slider = new Slider( $slider, options );
 * promise = slider.previous();
 */
let Slider;

/**
 * Controls of a slider
 * @class SliderControls
 *
 * @param {Slider} slider
 * @param {Object} userOptions
 * @param {HTMLElement} [userOptions.$btPrev]
 * @param {HTMLElement} [userOptions.$btNext]
 * @param {HTMLElement} [userOptions.$pagination]
 * @param {string} [userOptions.paginationItems]
 * @param {number} [userOptions.autoslide] - In second
 * @param {boolean} [userOptions.swipe=false]
 * @param {boolean} [userOptions.enableKeyboard=false]
 * @param {object} [userOptions.gestureOptions] - See gesture module options
 *
 * @see extra/modules/slider.md
 *
 * @example let controls = new SliderControls(
 *  slider,
 *  {
 *      "$btPrev": $previousButtton,
 *      "$btNext": $nextButton,
 *      "$pagination": $pagination,
 *      "paginationItems": '.item',
 *      "autoslide": 10, // in second
 *      "swipe": false,
 *      "enableKeyboard": true
 *  }
 * );
 */
let SliderControls;

{

function Slide(options) {
    let $slide, $links, size, lastOffset

    const SELF = this
    $slide = options.$slide
    $links = $slide.querySelectorAll('a,button,input,textarea,select')

    size = 100 // %

    this.id = $slide.id
    this.index = options.index
    this.position = options.index + 1
    this.currentPage = Math.floor(options.index / options.slidePerPage) + 1
    this.offsetToGo = options.index
    this.isFirst = options.index === 0

    if (options.moveByPage) {
        this.isLast = options.currentPage === options.nbPages
    } else {
        this.isLast = options.index === options.nbSlides - 1
    }

    this.delay = $slide.hasAttribute('data-delay')
        ? parseInt($slide.getAttribute('data-delay'), 10)
        : 0

    this.x = 0

    if (!this.id) {
        this.id = $slide.id = getNextSlideId()
    }

    $slide.setAttribute('role', 'tabpanel')

    function toggleElementsFocusability(activate) {
        if (!$links.length) {
            return
        }

        $links.forEach($link => {
            $link.setAttribute('tabindex', activate ? 0 : -1)
        })
    }

    this.isVisible = offset => {
        offset = offset || lastOffset
        return (
            offset >= -1 * options.nbSlideVisibleBefore &&
            offset < options.nbSlideVisibleAfter + options.slidePerPage
        )
    }

    this.isActive = offset => {
        offset = offset || lastOffset
        return offset >= 0 && offset < options.slidePerPage
    }

    function willMove(offset, direction) {
        if (direction === DIRECTION_PREVIOUS) {
            return (
                offset >= -1 * options.nbSlideVisibleBefore - 1 &&
                offset < options.nbSlideVisibleAfter + options.slidePerPage
            )
        } else {
            return (
                offset >= -1 * options.nbSlideVisibleBefore &&
                offset <= options.nbSlideVisibleAfter + options.slidePerPage
            )
        }
    }

    function getXMax(offset) {
        return (
            size *
            Math.min(offset, options.nbSlideVisibleAfter + options.slidePerPage)
        )
    }

    function getXMin(offset) {
        return size * Math.max(offset, -1 * options.nbSlideVisibleBefore - 1)
    }

    this.getHeight = () => {
        return outerHeight($slide)
    }

    this.setOffsetToGo = offset => {
        lastOffset = this.offsetToGo
        this.offsetToGo = offset
    }

    this.init = () => {
        if (this.offsetToGo === 0) {
            this.x = 0
        } else if (this.offsetToGo > 0) {
            this.x = getXMax(this.offsetToGo)
        } else if (this.offsetToGo < 0) {
            this.x = getXMin(this.offsetToGo)
        }

        TweenLite.set($slide, {
            x: 0,
            xPercent: this.x,
            position: this.offsetToGo === 0 ? 'relative' : 'absolute'
        })

        lastOffset = this.offsetToGo

        this[this.isActive() ? 'activate' : 'deactivate']()
    }

    this.initMoveTo = direction => {
        let x

        if (
            this.isVisible(lastOffset) ||
            !willMove(this.offsetToGo, direction)
        ) {
            return
        }

        if (direction === DIRECTION_PREVIOUS) {
            x = getXMax(this.offsetToGo - 1)
        } else {
            x = getXMin(this.offsetToGo + 1)
        }

        this.x = x

        TweenLite.set($slide, {
            x: 0,
            xPercent: x
        })
    }

    this.moveTo = (direction, easing) => {
        let x, prom, positionning

        if (
            !(
                willMove(this.offsetToGo, direction) ||
                willMove(lastOffset, direction)
            )
        ) {
            lastOffset = this.offsetToGo
            return Promise.resolve()
        }

        lastOffset = this.offsetToGo
        positionning = this.offsetToGo === 0 ? 'relative' : 'absolute'
        x = this.offsetToGo * size

        this.x = x

        prom = defer()

        TweenLite.to($slide, options.speed, {
            x: 0,
            xPercent: this.x,
            ease: easing,
            onComplete: () => {
                TweenLite.set($slide, {
                    position: positionning
                })

                SELF[SELF.isActive() ? 'activate' : 'deactivate']()

                prom.resolve()
            }
        })

        return prom
    }

    this.activate = () => {
        $slide.setAttribute('aria-hidden', false)
        toggleElementsFocusability(true)
    }

    this.deactivate = () => {
        $slide.setAttribute('aria-hidden', true)
        toggleElementsFocusability(false)
    }

    this.destroy = () => {
        $slide.removeAttribute('aria-hidden')
        $links.forEach($link => {
            $link.removeAttribute('tabindex')
        })

        TweenLite.killTweensOf($slide)
        TweenLite.set($slide, {
            clearProps: 'all'
        })
    }

    this.getSlideProperties = () => {
        return {
            $slide: $slide,
            id: this.id,
            delay: this.delay,
            index: SELF.index,
            position: SELF.position,
            isFirst: SELF.isFirst,
            isLast: SELF.isLast,
            isVisible: this.isVisible(),
            isActive: this.isActive()
        }
    }
}

const DIRECTION_NEXT = 1;
const DIRECTION_PREVIOUS = -1;

const SLIDER_EVENT_BEFORE = 'before';
const SLIDER_EVENT_BEFORE_EACH = 'beforeEach';
const SLIDER_EVENT_AFTER = 'after';
const SLIDER_EVENT_AFTER_EACH = 'afterEach';
const SLIDER_EVENT_START = 'start';

const defaultOptions = {
    startSlide: 0,
    nbSlideVisibleBefore: 0,
    nbSlideVisibleAfter: 0,
    slidePerPage: 1,
    moveByPage: true,
    speed: 0.5,
    smoothHeight: true,
    listSelector: ".list",
    itemsSelector: ".item",
    activeClass: "active-slide",
    loop: true
};

let customeSlideId = 0;

function getNextSlideId() {
    return ['__mdl_sld_', ++customeSlideId].join('');
}

Slider = function($slider, userOptions = {}) {
    let $slides,
        $list,
        slidesList,
        nbSlides,
        nbPages,
        currentSlide,
        state,
        STATE_IDLE,
        STATE_MOVING,
        EASE_NONE,
        options;

    const SELF = this;

    options = extend(defaultOptions, userOptions);

    if (!options.slidePerPage || options.slidePerPage < 1) {
        throw 'SLIDER: There must be at least one slide visible';
    }

    $list = $slider.querySelector(options.listSelector);
    $slides = $list.querySelectorAll(options.itemsSelector);
    nbSlides = $slides.length;

    STATE_IDLE = 'idle';
    STATE_MOVING = 'moving';
    state = STATE_IDLE;

    EASE_NONE = Linear.easeNone;

    slidesList = [];
    nbSlides = $slides.length;
    nbPages = Math.ceil(nbSlides / options.slidePerPage);

    /**
     * The DOM element of the slider
     *
     * @memberof Slider
     * @instance
     * @member {HTMLElement} $slider
     */
    Object.defineProperty(this, '$slider', {
        get: function() {
            return $slider;
        }
    });

    /**
     * Wrapper of the slides
     *
     * @memberof Slider
     * @instance
     * @member {HTMLElement} $list
     */
    Object.defineProperty(this, '$list', {
        get: function() {
            return $list;
        }
    });

    /**
     * All slides
     *
     * @memberof Slider
     * @instance
     * @member {HTMLElement[]} $slides
     */
    Object.defineProperty(this, '$slides', {
        get: function() {
            return $slides;
        }
    });


    /**
     * Number of slides
     *
     * @memberof Slider
     * @instance
     * @member {HTMLElement[]} slideCount
     */
    Object.defineProperty(this, 'slideCount', {
        get: function() {
            return nbSlides;
        }
    });

    /**
     * Number of pages (can have several slides by page)
     *
     * @memberof Slider
     * @instance
     * @member {HTMLElement[]} pageCount
     */
    Object.defineProperty(this, 'pageCount', {
        get: function() {
            return nbPages;
        }
    });

    /**
     * All slides
     *
     * @memberof Slider
     * @instance
     * @member {HTMLElement[]} $slides
     */
    Object.defineProperty(this, 'bulletCount', {
        get: function() {
            return options.moveByPage ? nbPages : nbSlides;
        }
    });


    function getNextSlideIndex(index, step = 1) {
        index = index + step;

        if (index >= nbSlides && options.loop) {
            index = 0;
        } else if (index >= nbSlides) {
            return -1;
        }

        return index;
    }

    function getPreviousSlideIndex(index, step = 1) {
        index = index - step;

        if (index < 0 && options.loop) {
            if (step === 1) {
                index = nbSlides - 1;
            } else {
                index = (nbPages - 1) * options.slidePerPage;
            }
        } else if (index < 0) {
            return -1;
        }

        return index;
    }

    function getNextSlide(index, step = 1) {
        index = getNextSlideIndex(index, step);

        if (index < 0) {
            return;
        }

        return slidesList[index];
    }

    function getPreviousSlide(index, step = 1) {
        index = getPreviousSlideIndex(index, step);

        if (index < 0) {
            return;
        }

        return slidesList[index];
    }

    function reorderSlidesWithLoop(activeSlide, direction) {
        let slide, nbSlideAfter, nbSlideBefore;

        slide = activeSlide;

        if (direction === DIRECTION_NEXT) {
            nbSlideAfter = Math.floor((nbSlides - options.slidePerPage) / 2);
            nbSlideBefore = nbSlides - options.slidePerPage - nbSlideAfter;
        } else {
            nbSlideBefore = Math.floor((nbSlides - options.slidePerPage) / 2);
            nbSlideAfter = nbSlides - options.slidePerPage - nbSlideBefore;
        }

        for (let indexBefore = 0; indexBefore < nbSlideBefore; ++indexBefore) {
            slide = getPreviousSlide(slide.index);
            slide.setOffsetToGo(-indexBefore - 1);
        }

        slide = activeSlide;
        slide.setOffsetToGo(0);

        for (
            let indexVisible = 1;
            indexVisible < options.slidePerPage;
            ++indexVisible
        ) {
            slide = getNextSlide(slide.index);
            slide.setOffsetToGo(indexVisible);
        }

        for (let indexAfter = 0; indexAfter < nbSlideAfter; ++indexAfter) {
            slide = getNextSlide(slide.index);
            slide.setOffsetToGo(options.slidePerPage + indexAfter);
        }
    }

    function reorderSlidesWithoutLoop(activeSlide) {
        for (let i = 0; i < nbSlides; ++i) {
            let slide = slidesList[i];

            if (i === activeSlide.index) {
                slide.setOffsetToGo(0);
            } else if (i < activeSlide.index - options.nbSlideVisibleBefore) {
                slide.setOffsetToGo(-options.nbSlideVisibleBefore - 1);
            } else if (
                i >
                activeSlide.index +
                    options.nbSlideVisibleAfter +
                    options.slidePerPage
            ) {
                slide.setOffsetToGo(
                    options.nbSlideVisibleAfter + options.slidePerPage
                );
            } else {
                slide.setOffsetToGo(i - activeSlide.index);
            }
        }
    }

    function reorderSlides(activeSlide, direction) {
        if (options.loop) {
            reorderSlidesWithLoop(activeSlide, direction);
        } else {
            reorderSlidesWithoutLoop(activeSlide);
        }
    }

    function moveSlides(nextActiveSlide, direction, easing, $button) {
        let promArray, callbackData;

        state = STATE_MOVING;
        promArray = [];

        callbackData = {
            targetSlide: nextActiveSlide.getSlideProperties(),
            currentSlide: currentSlide.getSlideProperties(),
            direction: direction
        };

        if ( $button ) {
            callbackData.$button = $button;
        }

        if (options.onBeforeEach) {
            options.onBeforeEach(callbackData);
        }


        /**
         * Before each slide move. If moving for 3 slides, it will be called 3 times.
         *
         * @event Slider#beforeEach
         * @type {object}
         * @property {SlideEventData_Params} data
         */
        fire(SELF, {
            "eventsName": SLIDER_EVENT_BEFORE_EACH,
            "detail": callbackData
        });

        reorderSlides(nextActiveSlide, direction);

        // All init first
        slidesList.forEach(slide => {
            slide.initMoveTo(direction);
        });

        // All move only after all init are done
        slidesList.forEach(slide => {
            promArray.push(slide.moveTo(direction, easing));
        });

        return Promise.all(promArray).then(() => {
            if (options.onAfterEach) {
                options.onAfterEach(callbackData);
            }

            /**
             * After each slide move. If moving for 3 slides, it will be called 3 times.
             *
             * @event Slider#afterEach
             * @type {object}
             * @property {SlideEventData_Params} data
             */
            fire(SELF, {
                "eventsName": SLIDER_EVENT_AFTER_EACH,
                "detail": callbackData
            });

            currentSlide = nextActiveSlide;
        });
    }

    function init() {
        reorderSlides(currentSlide, DIRECTION_NEXT);

        slidesList.forEach((slide, newPosition) => {
            slide.init(currentSlide, newPosition);
        });
    }

    function goPrevious(easing, $button) {
        let previousSlide;

        previousSlide = getPreviousSlide(currentSlide.index);

        if (!previousSlide) {
            return Promise.resolve();
        }

        return moveSlides(previousSlide, DIRECTION_PREVIOUS, easing, $button);
    }

    function goNext(easing, $button) {
        let nextSlide;

        nextSlide = getNextSlide(currentSlide.index);

        if (!nextSlide) {
            return Promise.resolve();
        }

        return moveSlides(nextSlide, DIRECTION_NEXT, easing, $button);
    }

    function getShortestWayAndDirection(index, askedDirection) {
        let setupOpt, indexOfFirstPage, indexOfLastPage, currentPageIndex;

        setupOpt = {};
        indexOfFirstPage = 0;
        indexOfLastPage = nbSlides - 1;
        currentPageIndex = currentSlide.index;

        // Store the natural direction
        setupOpt.direction =
            currentSlide.index > index ? DIRECTION_PREVIOUS : DIRECTION_NEXT;
        setupOpt.nbStepsStraight = Math.abs(currentPageIndex - index);

        if (!options.loop) {
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

        if (askedDirection === DIRECTION_PREVIOUS) {
            setupOpt.viaStartMove = true;
            setupOpt.straightMove = setupOpt.direction === DIRECTION_PREVIOUS;
            setupOpt.viaEndMove = false;
            setupOpt.direction = DIRECTION_PREVIOUS;

            setupOpt.nbStepsMin = setupOpt.straightMove ? setupOpt.nbStepsStraight : setupOpt.nbStepsViaStart;
        }
        else if (askedDirection === DIRECTION_NEXT) {
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

            if (setupOpt.viaStartMove && setupOpt.viaEndMove) {
                // Use the natural direction
                setupOpt.viaStartMove = setupOpt.direction === DIRECTION_PREVIOUS;
                setupOpt.viaEndMove = !setupOpt.viaStartMove;
            } else if (setupOpt.viaStartMove) {
                setupOpt.direction = DIRECTION_PREVIOUS;
            } else if (setupOpt.viaEndMove) {
                setupOpt.direction = DIRECTION_NEXT;
            }
        }

        return setupOpt;
    }

    function updateHeight(currentSlide, nextSlide, duration) {
        let deferred = defer();

        TweenLite.fromTo(
            $list,
            duration,
            {
                height: currentSlide.getHeight()
            },
            {
                height: nextSlide.getHeight(),
                onComplete: deferred.resolve
            }
        );

        return deferred;
    }

    function cleanListHeight() {
        TweenLite.set($list, {
            clearProps: 'height'
        });
    }

    function moveTo(index, askedDirection, $button) {
        let wayAndDirection,
            prom,
            fun,
            easing,
            lastCurrentSlide,
            nextSlide,
            promArray,
            callbackData;

        if (
            state !== STATE_IDLE ||
            index === currentSlide.index ||
            index < 0 ||
            index >= nbSlides
        ) {
            return Promise.resolve();
        }

        nextSlide = slidesList[index];
        promArray = [];

        wayAndDirection = getShortestWayAndDirection(index, askedDirection);
        fun =
            wayAndDirection.direction === DIRECTION_PREVIOUS
                ? goPrevious
                : goNext;
        easing = EASE_NONE;
        lastCurrentSlide = currentSlide;

        callbackData = {
            targetSlide: nextSlide.getSlideProperties(),
            currentSlide: lastCurrentSlide.getSlideProperties(),
            direction: wayAndDirection.direction
        };

        if ( $button ) {
            callbackData.$button = $button;
        }

        if (options.onBefore) {
            options.onBefore(callbackData);
        }

        /**
         * Before starting to move. Only one time for the whole animation.
         *
         * @event Slider#before
         * @type {object}
         * @property {SlideEventData_Params} data
         */
        fire(SELF, {
            "eventsName": SLIDER_EVENT_BEFORE,
            "detail": callbackData
        });

        for (let i = 0; i < wayAndDirection.nbStepsMin; ++i) {
            if (!prom) {
                prom = fun(easing, $button);
            } else {
                prom = prom.then(
                    (ea => {
                        return () => {
                            return fun(ea, $button);
                        };
                    })(easing)
                );
            }
        }

        if (options.smoothHeight) {
            promArray.push(
                updateHeight(
                    currentSlide,
                    nextSlide,
                    options.speed * wayAndDirection.nbStepsMin
                )
            );
        }

        promArray.push(prom);

        return Promise.all(promArray).then(() => {
            if (options.smoothHeight) {
                cleanListHeight();
            }

            if (options.onAfter) {
                options.onAfter(callbackData);
            }

            /**
             * After starting to move. Only one time for the whole animation.
             *
             * @event Slider#after
             * @type {object}
             * @property {SlideEventData_Params} data
             */
            fire(SELF, {
                "eventsName": SLIDER_EVENT_AFTER,
                "detail": callbackData
            });

            state = STATE_IDLE;
        });
    }

    /**
     * Go to the next slide or page
     *
     * @memberof Slider
     * @function next
     * @instance
     *
     * @returns {Promise}
     */
    this.next = $button => {
        let nextSlideIndex;

        if (state !== STATE_IDLE || (!options.loop && currentSlide.isLast)) {
            return Promise.resolve();
        }

        nextSlideIndex = getNextSlideIndex(
            currentSlide.index,
            options.moveByPage ? options.slidePerPage : 1
        );

        if (nextSlideIndex < 0) {
            return Promise.resolve();
        }

        return moveTo(nextSlideIndex, DIRECTION_NEXT, $button);
    };

    /**
     * Go to the previous slide or page
     *
     * @memberof Slider
     * @function previous
     * @instance
     *
     * @returns {Promise}
     */
    this.previous = $button => {
        let previousSlideIndex;

        if (state !== STATE_IDLE || (!options.loop && currentSlide.isFirst)) {
            return Promise.resolve();
        }

        previousSlideIndex = getPreviousSlideIndex(
            currentSlide.index,
            options.moveByPage ? options.slidePerPage : 1
        );

        if (previousSlideIndex < 0) {
            return Promise.resolve();
        }

        return moveTo(previousSlideIndex, DIRECTION_PREVIOUS, $button);
    };

    /**
     * Go to the asked slide or page
     *
     * @memberof Slider
     * @function goTo
     * @instance
     * @param {number} page
     *
     * @returns {Promise}
     */
    this.goTo = (page, $button) => {
        let index = options.moveByPage ? page * options.slidePerPage : page;

        return moveTo(index, null, $button);
    };

    /**
     * Check if the slider is enable or not
     *
     * @memberof Slider
     * @function isEnabled
     * @instance
     *
     * @returns {boolean}
     */
    this.isEnabled = () => {
        let nbSlidesVisible =
            options.nbSlideVisibleBefore +
            options.nbSlideVisibleAfter +
            options.slidePerPage;
        return (
            nbSlides > nbSlidesVisible ||
            (!options.loop && nbSlides === nbSlidesVisible)
        );
    };

    /**
     * Destroy the slider
     *
     * @memberof Slider
     * @function destroy
     * @instance
     */
    this.destroy = () => {
        if (this.isEnabled()) {
            slidesList.forEach(slide => {
                slide.destroy();
            });
            rClass($slider, options.activeClass);
        }
    };

    /**
     * Get the current active slide
     *
     * @memberof Slider
     * @function getCurrentSlide
     * @instance
     *
     * @returns {Slide}
     */
    this.getCurrentSlide = () => {
        return currentSlide;
    };


    /**
     * Get a slide in function of an index
     *
     * @memberof Slider
     * @function getSlide
     * @instance
     *
     * @param {number} index
     *
     * @returns {Slide}
     */
    this.getSlide = index => {
        return slidesList[index];
    };


    /**
     * Get the nbth slide after the index
     *
     * @memberof getTheNthChildAfter
     * @function getSlide
     * @instance
     *
     * @param {number} index - target index
     * @param {number} nb - Number of slide after the target
     *
     * @returns {Slide}
     */
    this.getTheNthChildAfter = (index, nb) => {
        return getNextSlide(index, nb);
    };


    /**
     * Get the nbth slide before the index
     *
     * @memberof getTheNthChildBefore
     * @function getSlide
     * @instance
     *
     * @param {number} index - target index
     * @param {number} nb - Number of slide before the target
     *
     * @returns {Slide}
     */
    this.getTheNthChildBefore = (index, nb) => {
        return getPreviousSlide(index, nb);
    };

    if (!this.isEnabled()) {
        return;
    }

    $slides.forEach(($slide, index) => {
        let slide = new Slide({
            nbSlideVisibleBefore: options.nbSlideVisibleBefore,
            nbSlideVisibleAfter: options.nbSlideVisibleAfter,
            slidePerPage: options.slidePerPage,
            moveByPage: true,
            nbSlides: nbSlides,
            nbPages: nbPages,
            speed: options.speed,
            $slide: $slide,
            index: index
        });

        if (slide.index === options.startSlide) {
            currentSlide = slide;
        }

        slidesList.push(slide);
    });

    aClass($slider, options.activeClass);

    init();

    wait().then(() => {
        let data = {
            currentSlide: currentSlide.getSlideProperties()
        };

        if (options.onStart) {
            options.onStart(data);
        }

        /**
         * On the initialization of the slider
         *
         * @event Slider#start
         * @type {object}
         * @property {SlideEventData_Params} data - Only currentSlide property
         */
        fire(SELF, {
            "eventsName": SLIDER_EVENT_START,
            "detail": data
        });
    });
};

SliderControls = function(slider, options) {
    let autoslideTimeoutId,
        keyboardPreviousButton,
        keyboardNextButton,
        $bullets,
        paginationKeyboardControls,
        inSlideKeyboardControls;

    const SELF = this;


    /**
     * Controlled slider
     *
     * @memberof SliderControls
     * @member {Slider} slider
     * @instance
     */
    Object.defineProperty(this, 'slider', {
        get: function() {
            return slider;
        }
    });

    if (options.$pagination && options.paginationItems) {
        $bullets = options.$pagination.querySelectorAll(
            options.paginationItems
        );
    }

    /**
     * Go to the next slide or page
     *
     * @memberof SliderControls
     * @function next
     * @instance
     *
     * @param {DOMElement} [$button] - Internal use
     *
     * @returns {Promise}
     */
    this.next = $button => {
        stopAutoslide();
        return slider.next($button);
    };

    /**
     * Go to the previous slide or page
     *
     * @memberof SliderControls
     * @function previous
     * @instance
     *
     * @param {DOMElement} [$button] - Internal use
     *
     * @returns {Promise}
     */
    this.previous = $button => {
        stopAutoslide();
        return slider.previous($button);
    };

    /**
     * Go to the asked slide or page
     *
     * @memberof SliderControls
     * @function goTo
     * @instance
     *
     * @param {number} index
     * @param {DOMElement} [$button] - Internal use
     *
     * @returns {Promise}
     */
    this.goTo = (index, $button) => {
        stopAutoslide();
        return slider.goTo(index, $button);
    };

    /**
     * Check if the slider is enable or not
     *
     * @memberof SliderControls
     * @function isEnabled
     * @instance
     *
     * @returns {boolean}
     */
    this.isEnabled = () => {
        return slider.isEnabled();
    };

    /**
     * Destroy the slider and its controls
     *
     * @memberof SliderControls
     * @function destroy
     * @instance
     */
    this.destroy = () => {
        clearTimeout(autoslideTimeoutId);
        slider.destroy();

        if (options.$btPrev) {
            gestureOff(options.$btPrev, '__sliderBtPrev');
        }

        if (options.$btNext) {
            gestureOff(options.$btNext, '__sliderBtNext');
        }

        if (keyboardPreviousButton) {
            keyboardPreviousButton.off();
        }

        if (keyboardNextButton) {
            keyboardNextButton.off();
        }

        if (paginationKeyboardControls) {
            paginationKeyboardControls.off();
        }

        if (inSlideKeyboardControls) {
            inSlideKeyboardControls.off();
        }

        if ($bullets) {
            gestureOff(
                options.$pagination,
                '__sliderBtPagination'
            );
        }

        if (options.swipe) {
            gestureOff(slider.$slider, '__sliderSwipe');
        }
    };

    function onPrev(e, $target) {
        e.preventDefault();

        SELF.previous($target);
    }

    function onNext(e, $target) {
        e.preventDefault();

        SELF.next($target);
    }

    function onPager(e, $target) {
        e.preventDefault();

        SELF.goTo(index($target), $target);
    }

    function stopAutoslide() {
        clearTimeout(autoslideTimeoutId);
        options.autoslide = 0;
    }

    function makeAutoslide() {
        slider.next().then(() => {
            if (options.autoslide) {
                autoslideLoop();
            }
        });
    }

    function autoslideLoop() {
        let currentSlide = slider.getCurrentSlide();

        clearTimeout(autoslideTimeoutId);

        autoslideTimeoutId = setTimeout(
            makeAutoslide,
            (currentSlide.delay || options.autoslide) * 1000
        );
    }

    function updateBullets(targetSlide, currentSlide) {
        if (!$bullets) {
            return;
        }

        if (currentSlide && $bullets[currentSlide.index]) {
            $bullets[currentSlide.index].setAttribute('aria-selected', false);
            $bullets[currentSlide.index].setAttribute('tabindex', -1);
        }

        if (targetSlide && $bullets[targetSlide.index]) {
            $bullets[targetSlide.index].setAttribute('aria-selected', true);
            $bullets[targetSlide.index].setAttribute('tabindex', 0);
        }
    }

    function updateBulletsFocus(data) {
        let currentSlide = data ? data.targetSlide : slider.getCurrentSlide();

        if ($bullets && $bullets[currentSlide.index]) {
            $bullets[currentSlide.index].focus();
        } else if (
            options.$pagination &&
            parseInt(options.$pagination.getAttribute('tabindex'), 10) > -1
        ) {
            options.$pagination.focus();
        }
    }

    // ------------------- INIT DOM

    on(slider, {
        "eventsName": "before",
        "callback": data => {
            updateBullets(data.targetSlide, data.currentSlide);
        }
    });

    on(slider, {
        "eventsName": "start",
        "callback": data => {
            updateBullets(data.currentSlide);
        }
    });

    if (options.$pagination) {
        options.$pagination.setAttribute('role', 'tablist');
    }

    if ($bullets) {
        $bullets.forEach(($bullet, index) => {
            let matchSlide = slider.getSlide(index);

            $bullet.setAttribute('role', 'tab');
            $bullet.setAttribute('aria-selected', false);
            $bullet.setAttribute('tabindex', -1);
            $bullet.setAttribute('aria-controls', matchSlide.id);
        });
    }

    // ------------------- BIND GESTURES

    if (options.$btPrev) {
        gesture(options.$btPrev, '__sliderBtPrev', {
            tap: onPrev,
        });
    }

    if (options.$btNext) {
        gesture(options.$btNext, '__sliderBtNext', {
            tap: onNext,
        });
    }

    if ($bullets) {
        gesture(options.$pagination, '__sliderBtPagination', {
            selector: options.paginationItems,
            tap: onPager,
        });
    }

    if (options.swipe) {
        let gestureOptions = {
            "preventStart": true,
            swipeLeft: () => {
                SELF.next();
            },
            swipeRight: () => {
                SELF.previous();
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
                        "swipeLeft": (...args) => {
                            SELF.next();
                            if ( options.gestureOptions.swipeLeft ) {
                                options.gestureOptions.swipeLeft.call( this, ...args );
                            }
                        }
                    }
                );
            }

            if ( options.gestureOptions.swipeRight ) {
                gestureOptions = extend(
                    gestureOptions,
                    {
                        "swipeRight": (...args) => {
                            SELF.previous();
                            if ( options.gestureOptions.swipeRight ) {
                                options.gestureOptions.swipeRight.call( this, ...args );
                            }
                        }
                    }
                );
            }
        }

        gesture( slider.$slider, '__sliderSwipe', gestureOptions );
    }

    // ------------------- BIND KEYBOARD

    if (options.enableKeyboard) {
        inSlideKeyboardControls = new KeyboardHandler(
            slider.$list,
            {
                onUp: e => {
                    if (e.ctrlKey) {
                        updateBulletsFocus();
                    }
                },
                onPageUp: e => {
                    if (e.ctrlKey) {
                        one(slider, {
                            "eventsName": "before",
                            "callback": updateBulletsFocus
                        });
                        slider.previous();
                    }
                },
                onPageDown: e => {
                    if (e.ctrlKey) {
                        one(slider, {
                            "eventsName": "before",
                            "callback": updateBulletsFocus
                        });
                        slider.next();
                    }
                },
            }
        );

        // ARROW KEY on bullets pagination

        if (options.$pagination) {
            paginationKeyboardControls = new KeyboardHandler(
                options.$pagination,
                {
                    selector: options.paginationItems,
                    onPrevious: () => {
                        one(slider, {
                            "eventsNAme": "before",
                            "callback": updateBulletsFocus
                        });
                        slider.previous();
                    },
                    onNext: () => {
                        one(slider, {
                            "eventsNAme": "before",
                            "callback": updateBulletsFocus
                        });
                        slider.next();
                    },
                }
            );
        }

        // SPACE and ENTER on buttons previous and next

        if (options.$btNext) {
            keyboardNextButton = new KeyboardHandler(
                options.$btNext,
                {
                    onSelect: onNext,
                }
            );
        }

        if (options.$btPrev) {
            keyboardPreviousButton = new KeyboardHandler(
                options.$btPrev,
                {
                    onSelect: onPrev,
                }
            );
        }
    }

    // ------------------- START AUTOSLIDE

    if (options.autoslide) {
        autoslideLoop();
    }
};

}

export { SliderControls, Slider };
