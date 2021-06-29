type GLImageTransitionFitType  = 'cover' | 'contains';

interface GLImageTransitionPreset {
    fsSource: string;
    addUniform?( GL: WebGLRenderingContext, SHADER_PROGRAM: WebGLProgram ): void;
    updateUniform?( GL: WebGLRenderingContext ): void;
    onTransitionStart?();
    onTransitionEnd?();
}


type GLImageTransitionOptionsType = {
    preset?:   GLImageTransitionPreset;
    /** @default document.body */
    $wrapper?: HTMLElement;
    /** @default webgl */
    context?:  string;
    /** @default cover */
    fitMode?: GLImageTransitionFitType;
    /**
     * Transition duration in second
     * @default 1
    */
    duration?: number;
    /**
     * 0 <= color <= 1
     * @default [0, 0, 0, 1]
    */
    backgroundColor?: number[];
    /**
     * Color displayed instead of the texture when an error occured on image loading. 0 <= color <= 1
     * @default [0, 0, 1, 1]
    */
    dummyTextureColor?: number[];
    canvasCssClass?: string;
    /**
     * Should the canvas size respond to the browser's size change
     * @default false
    */
    fluid?: boolean;
    /** Called juste before the loading start */
    onImageLoading?: ( url: string, isInit: boolean ) => void;
    /** Called once the loading is done */
    onImageLoaded?: ( url: string, isInit: boolean ) => void;
    /** Called on image loading error */
    onImageError?: ( url: string, isInit: boolean ) => void;
}
