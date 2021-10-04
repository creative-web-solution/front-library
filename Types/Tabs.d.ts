namespace FLib {
    namespace Tabs {
        type AnimationFunction = ( $tab: HTMLElement, $panel: HTMLElement ) => Promise<void>;
        type Callback          = ( $tab: HTMLElement, $panel: HTMLElement, autoClose?: boolean ) => void;


        type Options = {
            /** @defaultValue 'li[aria-selected]' */
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


        type TabOptions = Options & {
            onOpenTab: (( tab: Tab ) => void) | null;
            index:     number;
        }
    }
}
