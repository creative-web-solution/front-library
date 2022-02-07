declare namespace FLib {
    namespace Tabs {
        type AnimationFunction = ( $tab: HTMLElement, $panel: HTMLElement ) => Promise<void>;
        type Callback          = ( $tab: HTMLElement, $panel: HTMLElement, autoClose?: boolean ) => void;

        interface Tab {
            isOpened:                    boolean;
            index:                       number;
            close( autoClose?: boolean ): this;
            open( autoOpen?: boolean ):   this;
            destroy():                   this;
        }

        type Options = {
            /** @defaultValue 'li[aria-selected]' */
            tabSelector:    string;
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
            index:     number;
        }
    }
}
