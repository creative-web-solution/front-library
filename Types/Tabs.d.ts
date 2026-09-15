declare namespace FLib {
    namespace Tabs {
        type AnimationFunction = ( $tab: HTMLElement, $panel: HTMLElement ) => Promise<void>;
        type Callback          = ( $tab: HTMLElement, $panel: HTMLElement, autoClose?: boolean ) => void;

        type Options = {
            /** @defaultValue 'li[aria-selected]' */
            tabSelector:    string;
            /** @defaultValue false */
            selectOnFocus?:  boolean;
            onOpenAtStart?: Callback;
            onOpen?:        Callback;
            onClose?:       Callback;
            animations: {
                open:    AnimationFunction;
                close:   AnimationFunction;
                destroy: AnimationFunction;
            }
        }


        type TabOptions = Options & {
            onOpenTab?: ( tab: Tab ) => void;
            onFocusTab?: ( tab: Tab ) => void;
            index:     number;
        }
    }
}
