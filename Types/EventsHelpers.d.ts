namespace FLib {
    namespace Events {

        /**
         * ------------------------------------------------------
         * Device orientation Types
         *
         */
        namespace DeviceOrientation {

            type Type = 'landscape-primary' | 'portrait-primary' | 'landscape-secondary' | 'portrait-secondary' | '';

            type Options = {
                onOrientationChange: ( ( type: Type ) => void );
            }
        }


        /**
         * ------------------------------------------------------
         * Events manager Types
         *
         */
        namespace EventsManager {

            interface DataRegistry {
                $element: Element;
                eventName: string;
                options:   OnOptionsType;
                delegate?:  ( e ) => void;
            }

            type EventOptions = {
                capure?:  boolean;
                once?:    boolean;
                passive?: boolean;
            }

            type OnOptions = {
                /** Name of events separate by a space */
                eventsName:         string;
                /** Css selector used for event delegation */
                selector?:          string;
                callback:           ( e, $target? ) => void;
                /** Active or not event capture. */
                capture?:           boolean;
                /** Native addEventListener options. Priority to options.capture if it's present. */
                eventOptions?:      EventOptions;
                /** @internal */
                _internalCallback?: ( e, $target? ) => void;
            }

            type OffOptions = {
                /** Name of events separate by space */
                eventsName: string;
                callback?:  ( e, $target? ) => void;
            }

            type FireOptions = {
                /** Name of events separate by space */
                eventsName:  string;
                /** Object to send with the event */
                detail?:     any;
                /** Only used for DOM */
                bubbles?:    true;
                /** Only used for DOM */
                cancelable?: true;
            }
        }


        /**
         * ------------------------------------------------------
         * Gesture Types
         *
         */
        namespace Gesture {

            type Direction = 'up' | 'down' | 'left' | 'right' | 'up-right' | 'down-right' | 'up-left' | 'down-left' | 'none';


            type Mode = 'touch' | 'mouse' | 'pointer' | 'click';

            type Manager = {
                off();
            }

            type VelocityReturnType = {
                velocity:        number;
                averageVelocity: number;
                angle:           number;
                direction:       Direction;
            }

            type Coords = {
                pageX:   number;
                pageY:   number;
                clientX: number;
                clientY: number;
                mode:    Mode
            }

            type Velocity = {
                velocity:         number;
                velocityDistance: number;
                deltaTime:        number;
            }

            type PreventAndStopPropagation = boolean | (( e, $target: HTMLElement ) => boolean );
            type Callback                  = ( e: Event, $target: HTMLElement, coords: Coords, type: string ) => void;
            type SwipeCallback             = ( e: Event, $target: HTMLElement, type: string ) => void;


            interface Options {
                /** Used for event delegation */
                selector?:             string;
                /** In px, minimal distance to do to trigger events.
                 * @defaultValue 20
                 */
                threshold?:            number;
                /**
                 * Use all touch, pointer or mouse events, or only click event */
                useTouch?:             boolean;
                /**
                 * Cap valocity
                 * @defaultValue -1
                 */
                velocityMax?:          number;
                /**
                 * In deg, sensitivity of angle detection
                 * @defaultValue 2
                 */
                angleThreshold?:       number;
                /** @defaultValue false */
                preventClick?:         PreventAndStopPropagation;
                /** @defaultValue false */
                stopPropagationClick?: PreventAndStopPropagation;
                /** @defaultValue false */
                preventStart?:         PreventAndStopPropagation;
                /** @defaultValue false */
                stopPropagationStart?: PreventAndStopPropagation;
                /** @defaultValue false */
                preventMove?:          PreventAndStopPropagation;
                /** @defaultValue false */
                stopPropagationMove?:  PreventAndStopPropagation;
                /** @defaultValue false */
                preventEnd?:           PreventAndStopPropagation;
                /** @defaultValue false */
                stopPropagationEnd?:   PreventAndStopPropagation;
                /** touchstart, pointerdown, mousedown */
                start?:                Callback;
                /** touchmove, pointermove, mousemove */
                move?:                 Callback;
                /** touchend, pointerup, mouseup */
                end?:                  Callback;
                /** click */
                click?:                Callback;
                /** touchend on touch device, click on other */
                tap?:                  (( e: Event, $target: HTMLElement, coords: CoordsType, type: string ) => void);
                swipeLeft?:            SwipeCallback;
                swipeRight?:           SwipeCallback;
                swipeUp?:              SwipeCallback;
                swipeDown?:            SwipeCallback;
                swipe?:                (( e: Event, $target: HTMLElement, velocity: VelocityReturnType, type: string ) => void);
                moveLeft?:             SwipeCallback;
                moveRight?:            SwipeCallback;
                moveUp?:               SwipeCallback;
                moveDown?:             SwipeCallback;
            }

            type Elements = Node | NodeList | Node[] | HTMLElement | HTMLElement[];
        }


        /**
         * ------------------------------------------------------
         * History controller Types
         *
         */
        namespace History {
            type StateObject = {
                url:    UrlParser;
                state:  any;
                title:  string;
            }

            type Callback = ( url: UrlParser, state: any ) => void;
        }


        /**
         * ------------------------------------------------------
         * Images load Types
         *
         */
        namespace ImagesLoad {
            type LoadEvent = 'load' | 'error' | 'complete';

            interface CallbackParam {
                $element: Element;
                type:     LoadEvent;
            }

            interface PromiseLoad extends Promise<CallbackParam> {
                off();
            }

            interface PromisesLoad extends Promise<CallbackParam[]> {
                off();
            }
        }


        /**
         * ------------------------------------------------------
         * Intersect Observer Types
         *
         */
        namespace IntersectObserver {
            type Options = {
                /** Callback function */
                onIntersecting: ( $target: Node, entry: IntersectionObserverEntry ) => void;
                /** Execute the callback only once per $elements the first time it intersect the viewport. Default: false */
                onlyOnce?:       boolean;
                /** Native options to create to IntersectionObserver API */
                ioOptions?:      IntersectionObserverInit
            }
        }


        /**
         * ------------------------------------------------------
         * Keyboard handler Types
         *
         */
        namespace KeyboardHandler {
            type Callback = ( event: KeyboardEvent, $context: HTMLElement ) => void;

            type Options = {
                /** Used for event delegation */
                selector?:       string;
                /** Prevent default on all key pressed, except TAB */
                preventDefault?: boolean;
                onEnter?:        Callback;
                onSpace?:        Callback;
                /** Called when pressing ENTER or SPACE */
                onSelect?:       Callback;
                onEscape?:       Callback;
                onTab?:          Callback;
                onTabReverse?:   Callback;
                /** Called when pressing RIGHT ARROW KEYS */
                onRight?:        Callback;
                /** Called when pressing LEFT ARROW KEYS */
                onLeft?:         Callback;
                /** Called when pressing UP ARROW KEYS */
                onUp?:           Callback;
                /** Called when pressing DOWN ARROW KEYS */
                onDown?:         Callback;
                onPageUp?:       Callback;
                onPageDown?:     Callback;
                /** Called when pressing LEFT or DOWN arrow keys */
                onPrevious?:     Callback;
                /** Called when pressing RIGHT or UP arrow keys */
                onNext?:         Callback;
                /** Called on every key */
                onKey?:          Callback;
            }
        }


        /**
         * ------------------------------------------------------
         * Mediaqueries event Types
         *
         */
        namespace MediaqueriesEvents {

            type Breakpoint = {
                name:  string,

                /** Object buid with the window.matchMedia() function */
                query: MediaQueryList,

                /** mediaquery lower bound */
                min?:  number,

                /** mediaquery upper bound */
                max?:  number,

                /** Return true if the breakpoint is in the list: breakpoint.in(['bp1', 'bp2']) */
                in:    ( breakpointNameList: string[] ) => boolean,

                /** Return true if the name passed to the function is the name of the breakpoint: breakpoint.is */
                is:    ( breakpointName: string ) => boolean,

                /** @internal */
                handler: ( e: MediaQueryListEvent ) => void
            }

            type CallbackType = "enter" | "leave" | "both";

            type Callback = ( breakpoint: Breakpoint, isMatching?: boolean ) => void;

            type ListOptions = {
                name:   string,
                query?: MediaQueryList,
                min?:   number,
                max?:   number
            }

            type Options = {
                /** Default: px */
                unit?: string;
            }

            type InternalCallbackType = {
                callback: Callback,
                type:     CallbackType
            }
        }


        /**
         * ------------------------------------------------------
         * PubSub Types
         *
         */
        namespace PubSub {
            type Callback = ( data?: any ) => void;
        }


        /**
         * ------------------------------------------------------
         * Touch hover Types
         *
         */
        namespace TouchHover {
            type Options = {
                cssClass: string,
                selector: string,
                $wrapper: Element
            }
        }


        /**
         * ------------------------------------------------------
         * Window events Types
         *
         */
        namespace WindowEvents {
            type Type  =  'both' | 'force' | 'resize' | 'scroll';

            type ScrollInfo = {
                top:  number;
                left: number;
            }

            type WindowInfo = {
                width:  number;
                height: number;
            }

            type DocumentInfo = {
                width:  number;
                height: number;
            }

            type ViewportInfo = {
                top:     number;
                left:    number;
                bottom:  number;
                right:   number;
                width:   number;
                height:  number;
            }


            type CallbackParam = {
                windowInfo:   WindowInfoType,
                scrollInfo:   ScrollInfoType,
                documentInfo: DocumentInfoType,
                viewportInfo: ViewportInfoType
            }

            type Callback = ( info: CallbackParam, type: Type, e? ) => void;
        }
    }
}
