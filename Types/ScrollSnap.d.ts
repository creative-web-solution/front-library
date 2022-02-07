declare namespace FLib {
    namespace ScrollSnap {
        type SnapType = 'scroll' | 'api';

        type DirectionType = 'h' | 'v';

        type ScrollPropertyType = 'scrollLeft' | 'scrollTop';

        type SizePropertyType = 'scrollWidth' | 'scrollHeight';


        type Item = {
            coord:   number;
            index:   number;
            isFirst: boolean;
            isLast:  boolean;
            $item:   HTMLElement;
        }

        type ScrollToCallback  = ( snapItem: Item, snapItemType: SnapType ) => void;
        type Callback          = ( item: CallbackParam ) => void;

        type CallbackParam = {
            $scroller:    HTMLElement;
            snapItem:     Item;
            /** If the event comes after a scroll: scroll. If it comes after a function call (like next, previous, ...): api. */
            type:         SnapType;
            scrollerSize: number;
            offsetSize:   number;
        }

        type RefreshOption = {
            /** Selector or DOMList of the items */
            snapTo?:         string | NodeList;
            /** Item to put on the left */
            $itemToSnapOn?:  HTMLElement;
            $offsetElement?: HTMLElement;
            offset?: {
                top?:        number;
                left?:       number;
            };
            direction?:      DirectionType;
        }

        type Options = {
            /** @defaultValue locked */
            lockedClass?:        string;
            /** @defaultValue 2 */
            minItemsToActivate?: number;
            /** @defaultValue h */
            direction?:          DirectionType;
            /** Internal function using GSAP and scrollTo plugin to set the scroll. Can be override to use another library */
            _setScroll?:         ( $scroller: HTMLElement, x: number, y: number ) => void;
            $offsetElement?:     HTMLElement;
            offset?: {
                top?:            number;
                left?:           number;
            };
            onSnapStart?:        Callback;
            onSnapEnd?:          Callback;
            onReachStart?:       Callback;
            onReachEnd?:         Callback;
            snapTo?:             string | NodeList;
        }
    }
}
