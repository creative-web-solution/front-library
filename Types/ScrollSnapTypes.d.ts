type ScrollSnapSnapType = 'scroll' | 'api';

type ScrollSnapDirectionType = 'h' | 'v';

type ScrollSnapScrollPropertyType = 'scrollLeft' | 'scrollTop';

type ScrollSnapSizePropertyType = 'scrollWidth' | 'scrollHeight';


type ScrollSnapItemType = {
    coord:   number;
    index:   number;
    isFirst: boolean;
    isLast:  boolean;
    $item:   HTMLElement;
}

type ScrollToCallbackType  = ( snapItem: ScrollSnapItemType, snapItemType: ScrollSnapSnapType ) => void;
type ScrollSnapCallbackType = ( item: ScrollSnapCallbackParamType ) => void;

type ScrollSnapCallbackParamType = {
    $scroller:    HTMLElement;
    snapItem:     ScrollSnapItemType;
    /** If the event comes after a scroll: scroll. If it comes after a function call (like next, previous, ...): api. */
    type:         ScrollSnapSnapType;
    scrollerSize: number;
    offsetSize:   number;
}

type ScrollSnapRefreshOptionType = {
    /** Selector or DOMList of the items */
    snapTo?:         string | NodeList;
    /** Item to put on the left */
    $itemToSnapOn?:  HTMLElement;
    $offsetElement?: HTMLElement;
    offset?: {
        top?:        number;
        left?:       number;
    };
    direction?:      ScrollSnapDirectionType;
}

type ScrollSnapOptionsType = {
    /** @default locked */
    lockedClass?:        string;
    /** @default 2 */
    minItemsToActivate?: number;
    /** @default h */
    direction?:          ScrollSnapDirectionType;
    /** Internal function using GSAP and scrollTo plugin to set the scroll. Can be override to use another library */
    _setScroll?:         ( $scroller: HTMLElement, x: number, y: number ) => void;
    $offsetElement?:     HTMLElement;
    offset?: {
        top?:            number;
        left?:           number;
    };
    onSnapStart?:        ScrollSnapCallbackType;
    onSnapEnd?:          ScrollSnapCallbackType;
    onReachStart?:       ScrollSnapCallbackType;
    onReachEnd?:         ScrollSnapCallbackType;
    snapTo?:             string | NodeList;
}
