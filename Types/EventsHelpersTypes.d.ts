/**
 * ------------------------------------------------------
 * Device orientation Types
 *
 */

type DeviceOrientationType = 'landscape-primary' | 'portrait-primary' | 'landscape-secondary' | 'portrait-secondary' | '';

type DeviceOrientationOptionsType = {
    onOrientationChange: ( ( type: DeviceOrientationType ) => void );
}


/**
 * ------------------------------------------------------
 * Events manager Types
 *
 */

interface DataRegistryType {
    $element: Element;
    eventName: string;
    options:   OnOptionsType;
    delegate?:  ( e ) => void;
}

type EventOptionsType = {
    capure?:  boolean;
    once?:    boolean;
    passive?: boolean;
}

type OnOptionsType = {
    /** Name of events separate by a space */
    eventsName:         string;
    /** Css selector used for event delegation */
    selector?:          string;
    callback:           ( e ) => void;
    /** Active or not event capture. */
    capture?:           boolean;
    /** Native addEventListener options. Priority to options.capture if it's present. */
    eventOptions?:      EventOptionsType;
    /** @internal */
    _internalCallback?: ( e ) => void;
}

type OffOptionsType = {
    /** Name of events separate by space */
    eventsName: string;
    callback?:  ( e ) => void;
}

type FireOptionsType = {
    /** Name of events separate by space */
    eventsName:  string;
    /** Object to send with the event */
    detail?:     any;
    /** Only used for DOM */
    bubbles?:    true;
    /** Only used for DOM */
    cancelable?: true;
}


/**
 * ------------------------------------------------------
 * Gesture Types
 *
 */


type GestureDirectionType = 'up' | 'down' | 'left' | 'right' | 'up-right' | 'down-right' | 'up-left' | 'down-left' | 'none';


type GestureModeType = 'touch' | 'mouse' | 'pointer' | 'click';

type GestureManagerType = {
    off();
}

type GestureVelocityType = {
    velocity:        number;
    averageVelocity: number;
    angle:           number;
    direction:       GestureDirection;
}

type GestureCoordsType = {
    pageX:   number;
    pageY:   number;
    clientX: number;
    clientY: number;
    mode:    GestureMode
}

type VelocityType = {
    velocity:         number;
    velocityDistance: number;
    deltaTime:        number;
}

type PreventAndStopPropagationType = boolean | (( e, $target: HTMLElement ) => boolean );
type GestureCallbackType           = ( e: Event, $target: HTMLElement, coords: GestureCoordsType, type: string ) => void;
type GestureSwipeCallbackType      = ( e: Event, $target: HTMLElement, type: string ) => void;


interface GestureOptionsType {
    /** Used for event delegation */
    selector?:             string;
    /** In px, minimal distance to do to trigger events.
     * @default 20
     */
    threshold?:            number;
    /**
     * Use all touch, pointer or mouse events, or only click event */
    useTouch?:             boolean;
    /**
     * Cap valocity
     * @default -1
     */
    velocityMax?:          number;
    /**
     * In deg, sensitivity of angle detection
     * @default 2
     */
    angleThreshold?:       number;
    /** @default false */
    preventClick?:         PreventAndStopPropagationType;
    /** @default false */
    stopPropagationClick?: PreventAndStopPropagationType;
    /** @default false */
    preventStart?:         PreventAndStopPropagationType;
    /** @default false */
    stopPropagationStart?: PreventAndStopPropagationType;
    /** @default false */
    preventMove?:          PreventAndStopPropagationType;
    /** @default false */
    stopPropagationMove?:  PreventAndStopPropagationType;
    /** @default false */
    preventEnd?:           PreventAndStopPropagationType;
    /** @default false */
    stopPropagationEnd?:   PreventAndStopPropagationType;
    /** touchstart, pointerdown, mousedown */
    start?:                GestureCallbackType;
    /** touchmove, pointermove, mousemove */
    move?:                 GestureCallbackType;
    /** touchend, pointerup, mouseup */
    end?:                  GestureCallbackType;
    /** click */
    click?:                GestureCallbackType;
    /** touchend on touch device, click on other */
    tap?:                  (( e: Event, $target: HTMLElement, coords: GestureCoordsType, type: string ) => void);
    swipeLeft?:            GestureSwipeCallbackType;
    swipeRight?:           GestureSwipeCallbackType;
    swipeUp?:              GestureSwipeCallbackType;
    swipeDown?:            GestureSwipeCallbackType;
    swipe?:                (( e: Event, $target: HTMLElement, velocity: GestureVelocityType, type: string ) => void);
    moveLeft?:             GestureSwipeCallbackType;
    moveRight?:            GestureSwipeCallbackType;
    moveUp?:               GestureSwipeCallbackType;
    moveDown?:             GestureSwipeCallbackType;
}

type GestureElementsType = Node | NodeList | Node[] | HTMLElement | HTMLElement[];


/**
 * ------------------------------------------------------
 * History controller Types
 *
 */

type HistoryStateObjectType = {
    url:    UrlParser;
    state:  any;
    title:  string;
}

type HistoryCallbackType = ( url: UrlParser, state: any ) => void;


/**
 * ------------------------------------------------------
 * Images load Types
 *
 */

interface ImagePromiseType extends Promise<any> {
    off();
}

interface ImagesPromiseType extends Promise<any> {
    off();
}

type ImageLoadEventType = 'load' | 'error' | 'complete';


/**
 * ------------------------------------------------------
 * Intersect Observer Types
 *
 */

type IntersectObserverOptionsType = {
    /** Callback function */
    onIntersecting: ( $target: Node, entry: IntersectionObserverEntry ) => void;
    /** Execute the callback only once per $elements the first time it intersect the viewport. Default: false */
    onlyOnce?:       boolean;
    /** Native options to create to IntersectionObserver API */
    ioOptions?:      IntersectionObserverInit
}


/**
 * ------------------------------------------------------
 * Keyboard handler Types
 *
 */

type KeyboardHandlerCallback = ( event: KeyboardEvent, $context: HTMLElement ) => void;

type KeyboardHandlerOptions = {
    /** Used for event delegation */
    selector?:       string;
    /** Prevent default on all key pressed, except TAB */
    preventDefault?: boolean;
    onEnter?:        KeyboardHandlerCallback;
    onSpace?:        KeyboardHandlerCallback;
    /** Called when pressing ENTER or SPACE */
    onSelect?:       KeyboardHandlerCallback;
    onEscape?:       KeyboardHandlerCallback;
    onTab?:          KeyboardHandlerCallback;
    onTabReverse?:   KeyboardHandlerCallback;
    /** Called when pressing RIGHT ARROW KEYS */
    onRight?:        KeyboardHandlerCallback;
    /** Called when pressing LEFT ARROW KEYS */
    onLeft?:         KeyboardHandlerCallback;
    /** Called when pressing UP ARROW KEYS */
    onUp?:           KeyboardHandlerCallback;
    /** Called when pressing DOWN ARROW KEYS */
    onDown?:         KeyboardHandlerCallback;
    onPageUp?:       KeyboardHandlerCallback;
    onPageDown?:     KeyboardHandlerCallback;
    /** Called when pressing LEFT or DOWN arrow keys */
    onPrevious?:     KeyboardHandlerCallback;
    /** Called when pressing RIGHT or UP arrow keys */
    onNext?:         KeyboardHandlerCallback;
    /** Called on every key */
    onKey?:          KeyboardHandlerCallback;
}


/**
 * ------------------------------------------------------
 * Mediaqueries event Types
 *
 */

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

type MediaQueriesEventsCallbackType = "enter" | "leave" | "both";

type MediaQueriesEventsCallback = ( breakpoint: Breakpoint, isMatching?: Boolean ) => void;

type MediaQueriesEventsListOptions = {
    name:   string,
    query?: MediaQueryList,
    min?:   number,
    max?:   number
}

type MediaQueriesEventsOptions = {
    /** Default: px */
    unit?: string;
}

type MediaQueriesEventsInternalCallbackType = {
    callback: MediaQueriesEventsCallback,
    type:     MediaQueriesEventsCallbackType
}


/**
 * ------------------------------------------------------
 * PubSub Types
 *
 */

type PubSubCallbackType = ( data?: any ) => void;


/**
 * ------------------------------------------------------
 * Touch hover Types
 *
 */

type TouchHoverOptions = {
    cssClass: string,
    selector: string,
    $wrapper: Element
}


/**
 * ------------------------------------------------------
 * Window events Types
 *
 */


type WindowEventsType  =  'both' | 'force' | 'resize' | 'scroll';

type ScrollInfoType = {
    top:  number;
    left: number;
}

type WindowInfoType = {
    width:  number;
    height: number;
}

type DocumentInfoType = {
    width:  number;
    height: number;
}

type ViewportInfoType = {
    top:     number;
    left:    number;
    bottom:  number;
    right:   number;
    width:   number;
    height:  number;
}


type WindowEventsCallbackParam = {
    windowInfo:   WindowInfoType,
    scrollInfo:   ScrollInfoType,
    documentInfo: DocumentInfoType,
    viewportInfo: ViewportInfoType
}


type WindowEventsCallbackType = ( info: WindowEventsCallbackParam, type: WindowEventsType, e? ) => void;


