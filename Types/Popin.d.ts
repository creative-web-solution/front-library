namespace FLib {
    namespace Popin {
        type AnimationFunction = ( $element: HTMLElement ) => Promise<void>;
        type ResponseType          = 'arrayBuffer' | 'blob' | 'json' | 'text' | 'formData';

        interface TemplatesOptions {
            /** @defaultValue `<div class="popin-loader"></div>` */
            popinLoader:  string;
            /** @defaultValue `<div class="popin"><div class="popin-content"></div></div>` */
            popin:        string;
            /** @defaultValue `<div class="bg-popin"></div>` */
            bgLayer:      string;
            /** @defaultValue `"<div class="error">{{ message }}</div>"` */
            errorMessage: string;
        }

        interface SelectorsOptions {
            /** @defaultValue .popin */
            popin:               string;
            /** @defaultValue .popin-content */
            popinContent:        string;
            /** @defaultValue a[data-popin] */
            links:               string;
            /** @defaultValue form[data-popin] */
            forms:               string;
            /** @defaultValue button[data-close-popin] */
            btClosePopin:        string;
            /** @defaultValue data-onload-popin */
            openOnLoadAttribute: string;
        }

        interface AnimationsOptions {
            /** @defaultValue `$bg => { $bg.style.display = 'block'; return Promise.resolve(); }` */
            openBg:        AnimationFunction;
            /** @defaultValue `$bg => { $bg.style.display = 'none'; return Promise.resolve(); }` */
            closeBg:       AnimationFunction;
            /** @defaultValue `$popin => { $popin.style.display = 'block'; $popin.style.opacity = 0; return Promise.resolve(); }` */
            initOpenPopin: AnimationFunction;
            /** @defaultValue `$popin => { $popin.style.opacity = 1; return Promise.resolve(); }` */
            openPopin:     AnimationFunction;
            /** @defaultValue `$popin => { $popin.style.display = 'none'; return Promise.resolve(); }` */
            closePopin:    AnimationFunction;
            /** @defaultValue `$loader => { $loader.style.display = 'block'; return Promise.resolve(); }` */
            openLoader:    AnimationFunction;
            /** @defaultValue `$loader => { $loader.style.display = 'none'; return Promise.resolve(); }` */
            closeLoader:   AnimationFunction;
        }

        interface Options {
            /** @defaultValue false */
            modal:             boolean;
            /** @defaultValue 20 */
            marginHeight:      number;
            /** @defaultValue false */
            autoResize:        boolean;
            /** @defaultValue "Error while loading.." */
            errorMessage:      string;
            /** @defaultValue true */
            enableKeyboard:    boolean;
            onOpen?:            ( $popin: HTMLElement ) => void;
            onClose?:           ( $popin: HTMLElement ) => void;
            onLoad:             ( $popin: HTMLElement ) => Promise<void>;
            /** @defaultValue `() => 'text'` */
            setLinkResponseType: ( url: string, $link: HTMLAnchorElement ) => ResponseType;
            /** @defaultValue `() => 'text'` */
            setFormResponseType: ( $form: HTMLElement ) => ResponseType;
            /** @defaultValue `() => true` */
            checkValidity:       ( $form: HTMLElement ) => boolean | Promise<void>;
            /** @defaultValue `(body) => { return { success: true, data: body }`  */
            normalize:           ( body, response, isHttpError: boolean ) => { success: boolean, data };
            /**
             * If false, ajax http error (404, 500, ...) should be handled in the normalize function
             * @defaultValue true
            */
            autoHandleAjaxError: boolean;
            templates:           TemplatesOptions;
            selectors:           SelectorsOptions;
            animations:          AnimationsOptions;
        }


        interface ControllerOptions {
            controller: Controller;
            background: Background;
        }


        interface OptionsInit extends Partial<Options> {
            templates?:           Partial<TemplatesOptions>;
            selectors?:           Partial<SelectorsOptions>;
            animations?:          Partial<AnimationsOptions>;

        }
    }
}
