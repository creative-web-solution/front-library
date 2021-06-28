type SlidePropertiesType = {
    $slide:     HTMLElement;
    id:         string;
    delay:      number;
    index:      number;
    position:   number;
    isFirst:    boolean;
    isLast:     boolean;
    isVisible:  boolean;
    isActive:   boolean;
    page:       number;
    pageIndex:  number;
}


type SlideOptionsType = {
    nbSlideVisibleBefore: number;
    nbSlideVisibleAfter:  number;
    slidePerPage:         number;
    moveByPage:           boolean;
    nbSlides:             number;
    nbPages:              number;
    speed:                number;
    $slide:               HTMLElement;
    index:                number;
    /** Internal function using GSAP to set CSS styles. Can be override to use another library */
    _setStyle?:             ( $elem, styles ) => void;
    /** Internal function using GSAP to tween element. Can be override to use another library */
    _tweenTo?:              ( $elem, styles ) => void;
    /** Internal function using GSAP to initialize and tween element. Can be override to use another library */
    _tweenFromTo?:          ( $elem, init, styles  ) => void;
    /** Internal function using GSAP to remove tweens from element. Can be override to use another library */
    _killTweens?:           ( $elem ) => void;
}


type SliderCallbackType     = ({ currentSlide: SlidePropertiesType, targetSlide: SlidePropertiesType }) => void;
type SliderInitCallbackType = ({ currentSlide: SlidePropertiesType }) => void;

type SliderOptionsType = {
    /** @default 0 */
    startSlide?:            number;
    /** @default 0 */
    nbSlideVisibleBefore?:  number;
    /** @default 0 */
    nbSlideVisibleAfter?:   number;
    /** @default 1 */
    slidePerPage?:          number;
    /** @default true */
    moveByPage?:            boolean;
    /** In second
     * @default 0.5
    */
    speed?:                 number;
    /** @default true */
    smoothHeight?:          boolean;
    /** @default .list */
    listSelector?:          string;
    /** @default .item */
    itemsSelector?:         string;
    /** @default  */
    activeClass?:           string;
    /** @default active-slide */
    loop?:                  boolean;
    /** Called one time at the begining of the animation */
    onBefore?:              SliderCallbackType;
    /** Called for every slide that will come in the 1st position during the animation */
    onBeforeEach?:          SliderCallbackType;
    /** Called one time at the end of the animation */
    onAfter?:               SliderCallbackType;
    /** Called for every slide that is came in the 1st position during the animation */
    onAfterEach?:           SliderCallbackType;
    /** Called one time at the initialisation of the slider */
    onStart?:               SliderInitCallbackType;
    /** Internal function using GSAP to set CSS styles. Can be override to use another library */
    _setStyle?:             ( $elem, styles ) => void;
    /** Internal function using GSAP to tween element. Can be override to use another library */
    _tweenTo?:              ( $elem, styles ) => void;
    /** Internal function using GSAP to initialize and tween element. Can be override to use another library */
    _tweenFromTo?:          ( $elem, init, styles  ) => void;
    /** Internal function using GSAP to remove tweens from element. Can be override to use another library */
    _killTweens?:           ( $elem ) => void;
}

type SliderControlsOptionsType = {
    $btPrev?:                 HTMLElement;
    $btNext?:                 HTMLElement;
    $pagination?:             HTMLElement;
    paginationItemsSelector?: string;
    /** In second */
    autoslide?:               number | boolean;
    swipe?:                   boolean;
    enableKeyboard?:          boolean;
    gestureOptions?:          GestureOptionsType;
}
