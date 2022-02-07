declare namespace FLib {
    namespace Accordion {

        interface Tab {
            close( autoClose?: boolean ): this;
            destroy(): this;
        }

        type AnimationFunction = ( $tab: HTMLElement, $panel: HTMLElement ) => Promise<void>;
        type Callback          = ( $tab: HTMLElement, $panel: HTMLElement ) => void;
        type CloseCallback     = ( $tab: HTMLElement, $panel: HTMLElement, autoclose: boolean ) => void;

        interface AnimationOptions {
            open:          AnimationFunction;
            close:         AnimationFunction;
            destroy:       AnimationFunction;
        }

        interface Options {
            /** @defaultValue 'button[aria-expanded]' */
            tabSelector:       string;
            /** @defaultValue false */
            allowMultipleTab:  boolean;
            /** @defaultValue false */
            atLeastOneOpen:    boolean;
            onOpenAtStart:     Callback;
            onOpen:            Callback;
            onClose:           CloseCallback;
            animations:        Partial<AnimationOptions>;
        }

        interface OptionsInit extends Partial<Options> {
            animations?:        Partial<AnimationOptions>;
        }

        interface TabOptions extends Options {
            onOpenTab?: ( tab: Tab ) => void;
            index:     number;
        }
    }
}
