namespace FLib {
    namespace Accordion {

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
            animations:        AnimationOptions;
        }

        interface OptionsInit extends Partial<Options> {
            animations?:        Partial<AnimationOptions>;
        }

        interface TabOptions extends Options {
            onOpenTab: (( tab: Tab ) => void) | null;
            index:     number;
        }
    }
}
