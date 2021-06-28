type PopinAnimationFunctionType = ( $element: HTMLElement ) => Promise<void>;
type PopinResponseType          = 'arrayBuffer' | 'blob' | 'json' | 'text' | 'formData';

type PopinTemplatesOptionsType = {
    /** @default <div class="popin-loader"></div> */
    popinLoader?:  string;
    /** @default <div class="popin"><div class="popin-content"></div></div> */
    popin?:        string;
    /** @default <div class="bg-popin"></div> */
    bgLayer?:      string;
    /** @default <div class="error"><%= message %></div> */
    errorMessage?: string;
}

type PopinSelectorsOptionsType = {
    /** @default .popin */
    popin?:               string;
    /** @default .popin-content */
    popinContent?:        string;
    /** @default a[data-popin] */
    links?:               string;
    /** @default form[data-popin] */
    forms?:               string;
    /** @default button[data-close-popin] */
    btClosePopin?:        string;
    /** @default data-onload-popin */
    openOnLoadAttribute?: string;
}

type PopinAnimationsOptionsType = {
    /** @default $bg => { $bg.style.display = 'block'; return Promise.resolve(); } */
    openBg?:        PopinAnimationFunctionType;
    /** @default $bg => { $bg.style.display = 'none'; return Promise.resolve(); } */
    closeBg?:       PopinAnimationFunctionType;
    /** @default $popin => { $popin.style.display = 'block'; $popin.style.opacity = 0; return Promise.resolve(); } */
    initOpenPopin?: PopinAnimationFunctionType;
    /** @default $popin => { $popin.style.opacity = 1; return Promise.resolve(); } */
    openPopin?:     PopinAnimationFunctionType;
    /** @default $popin => { $popin.style.display = 'none'; return Promise.resolve(); } */
    closePopin?:    PopinAnimationFunctionType;
    /** @default $loader => { $loader.style.display = 'block'; return Promise.resolve(); } */
    openLoader?:    PopinAnimationFunctionType;
    /** @default $loader => { $loader.style.display = 'none'; return Promise.resolve(); } */
    closeLoader?:   PopinAnimationFunctionType;
}

type PopinOptionsType = {
    /** @default false */
    modal?:             boolean;
    /** @default 20 */
    marginHeight?:      number;
    /** @default false */
    autoResize?:        boolean;
    /** @default "Error while loading.." */
    errorMessage?:      string;
    /** @default true */
    enableKeyboard?:    boolean;
    onOpen?:            ( $popin: HTMLElement ) => void;
    onClose?:           ( $popin: HTMLElement ) => void;
    onLoad?:            ( $popin: HTMLElement ) => Promise<void>;
    /** @default () => 'text' */
    setLinkResponseType?: ( url: string, $link: HTMLAnchorElement ) => PopinResponseType;
    /** @default () => 'text' */
    setFormResponseType?: ( $form: HTMLElement ) => PopinResponseType;
    /** @default () => true */
    checkValidity?:       ( $form: HTMLElement ) => boolean | Promise<void>;
    /** @default (body) => { return { success: true, data: body }  */
    normalize?:           ( body, response, isHttpError: boolean ) => { success: boolean, data };
    /**
     * If false, ajax http error (404, 500, ...) should be handled in the normalize function
     * @default true
    */
    autoHandleAjaxError?: boolean;
    templates?:           PopinTemplatesOptionsType;
    selectors?:           PopinSelectorsOptionsType;
    animations?:          PopinAnimationsOptionsType;
}


type PopinControllerOptionsType = {
    controller: PopinController;
    background: PopinBackground;
}
