type TabsAnimationFunctionType = ( $tab: HTMLElement, $panel: HTMLElement ) => Promise<void>;
type TabsCallbackType          = ( $tab: HTMLElement, $panel: HTMLElement, autoClose?: boolean ) => void;


type TabsOptionsType = {
    /** Default: 'li[aria-selected]' */
    tabSelector:    string;
    onOpenAtStart?: TabsCallbackType;
    onOpen?:        TabsCallbackType;
    onClose?:       TabsCallbackType;
    animations: {
        open:    TabsAnimationFunctionType;
        close:   TabsAnimationFunctionType;
        destroy: TabsAnimationFunctionType;
    }
}


type TabOptionsType = TabsOptionsType & {
    onOpenTab: (( tab: Tab ) => void) | null;
    index:     number;
}
