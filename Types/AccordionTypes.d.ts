type AccordionAnimationFunctionType = ( $tab: HTMLElement, $panel: HTMLElement ) => Promise<void>;
type AccordionCallbackType          = ( $tab: HTMLElement, $panel: HTMLElement ) => void;
type AccordionCloseCallbackType     = ( $tab: HTMLElement, $panel: HTMLElement, autoclose: boolean ) => void;


type AccordionOptionsType = {
    /** Default: 'button[aria-expanded]' */
    tabSelector:       string;
    /** Default: false */
    allowMultipleTab?: boolean;
    /** Default: false */
    atLeastOneOpen?:   boolean;
    onOpenAtStart?:    AccordionCallbackType;
    onOpen?:           AccordionCallbackType;
    onClose?:          AccordionCloseCallbackType;
    animations?: {
        open?:         AccordionAnimationFunctionType;
        close?:        AccordionAnimationFunctionType;
        destroy?:      AccordionAnimationFunctionType;
    }
}


type AccordionTabOptionsType = AccordionOptionsType & {
    onOpenTab: (( tab: Tab ) => void) | null;
    index:     number;
}
