namespace FLib {
    namespace GLImageTransition {
        type FitType  = 'cover' | 'contains';

        interface Preset {
            fsSource: string;
            addUniform?( GL: WebGLRenderingContext, SHADER_PROGRAM: WebGLProgram ): void;
            updateUniform?( GL: WebGLRenderingContext ): void;
            onTransitionStart?();
            onTransitionEnd?();
        }


        type Options = {
            preset:   Preset;
            /** @defaultValue document.body */
            $wrapper: HTMLElement;
            /** @defaultValue webgl */
            context:  string;
            /** @defaultValue cover */
            fitMode: FitType;
            /**
             * Transition duration in second
             * @defaultValue 1
            */
            duration: number;
            /**
             * 0 &lt;= color &lt;= 1
             * @defaultValue [0, 0, 0, 1]
            */
            backgroundColor: number[];
            /**
             * Color displayed instead of the texture when an error occured on image loading. 0 &lt;= color &lt;= 1
             * @defaultValue [0, 0, 1, 1]
            */
            dummyTextureColor: number[];
            canvasCssClass?: string;
            /**
             * Should the canvas size respond to the browser's size change
             * @defaultValue false
            */
            fluid: boolean;
            /** Called juste before the loading start */
            onImageLoading?: ( url: string, isInit: boolean ) => void;
            /** Called once the loading is done */
            onImageLoaded?: ( url: string, isInit: boolean ) => void;
            /** Called on image loading error */
            onImageError?: ( url: string, isInit: boolean ) => void;
        }
    }
}
