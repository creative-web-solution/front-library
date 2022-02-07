declare namespace FLib {
    namespace Slider {
        type SlideDirection = -1 | 1;

        type SlideProperties = {
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


        type SlideOptions = {
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

        type CallbackParam = {
            currentSlide: SlideProperties;
            targetSlide: SlideProperties;
            direction?: SlideDirection;
            $button?: HTMLElement
        }
        type Callback     = ( data: CallbackParam ) => void;
        type InitCallback = ({ currentSlide: SlidePropertiesType }) => void;

        type Options = {
            /** @defaultValue 0 */
            startSlide:             number;
            /** @defaultValue 0 */
            nbSlideVisibleBefore:   number;
            /** @defaultValue 0 */
            nbSlideVisibleAfter:    number;
            /** @defaultValue 1 */
            slidePerPage:           number;
            /** @defaultValue true */
            moveByPage:             boolean;
            /** In second
             * @defaultValue 0.5
            */
            speed:                  number;
            /** @defaultValue true */
            smoothHeight:           boolean;
            /** @defaultValue .list */
            listSelector:           string;
            /** @defaultValue .item */
            itemsSelector:          string;
            /** @defaultValue active-slide */
            activeClass:            string;
            /** @defaultValue true*/
            loop:                   boolean;
            /** Called one time at the begining of the animation */
            onBefore?:              Callback;
            /** Called for every slide that will come in the 1st position during the animation */
            onBeforeEach?:          Callback;
            /** Called one time at the end of the animation */
            onAfter?:               Callback;
            /** Called for every slide that is came in the 1st position during the animation */
            onAfterEach?:           Callback;
            /** Called one time at the initialisation of the slider */
            onStart?:               InitCallback;
            /** Internal function using GSAP to set CSS styles. Can be override to use another library */
            _setStyle:              ( $elem, styles ) => void;
            /** Internal function using GSAP to tween element. Can be override to use another library */
            _tweenTo:               ( $elem, styles ) => void;
            /** Internal function using GSAP to initialize and tween element. Can be override to use another library */
            _tweenFromTo:           ( $elem, init, styles  ) => void;
            /** Internal function using GSAP to remove tweens from element. Can be override to use another library */
            _killTweens:            ( $elem ) => void;
        }

        type ControlsOptions = {
            $btPrev?:                 HTMLElement;
            $btNext?:                 HTMLElement;
            $pagination?:             HTMLElement;
            paginationItemsSelector?: string;
            /** In second */
            autoslide?:               number | boolean;
            swipe?:                   boolean;
            enableKeyboard?:          boolean;
            gestureOptions?:          FLib.Events.Gesture.Options;
        }
    }
}
