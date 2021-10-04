/**
 * All colors go to white on the current image et go to the color of the next one
 */
export default class Solarisation implements FLib.GLImageTransition.Preset {

    #fadeToBlack:      boolean;
    #fadeToBlackValue: number;
    #U_FADE_TO_BLACK!: WebGLUniformLocation | null;


    get fsSource(): string {
        return `
            #ifdef GL_ES
            precision mediump float;
            #endif

            varying highp vec2 vTextureCoord;

            uniform sampler2D uSampler;
            uniform sampler2D uSampler2;
            uniform float uProgress;
            uniform float uTime;
            uniform float uDeltaTime;
            uniform float uFadeToBlack;

            void main(void) {
                vec3 t1Color = texture2D(uSampler, vTextureCoord).rgb;
                vec3 t2Color = texture2D(uSampler2, vTextureCoord).rgb;

                vec3 colorFactor = ( 1. - uFadeToBlack * 2. ) * vec3( 1.0 );
                float progress = uProgress * 2.;

                vec3 color =
                        step( uProgress, 0.5 ) * ( t1Color + colorFactor * progress ) +
                        step( 0.5, uProgress ) * ( t2Color + colorFactor * ( 2. - progress ) );

                gl_FragColor = vec4( color, 1.0 );
            }
        `;
    }

    get fadeToBlack(): boolean {
        return this.#fadeToBlack;
    }

    get U_FADE_TO_BLACK(): WebGLUniformLocation | null {
        return this.#U_FADE_TO_BLACK;
    }



    /**
     * Solarisation constructor
     *
     * @param fadeToBlack - Fade to black instead of white
     */
    constructor( fadeToBlack = false ) {
        this.#fadeToBlack      = fadeToBlack;
        this.#fadeToBlackValue = fadeToBlack ? 1 : 0;
    }


    /**
     * Create specific uniforms for this preset
     */
    addUniform( GL: WebGLRenderingContext, SHADER_PROGRAM: WebGLProgram ): void {
        this.#U_FADE_TO_BLACK = GL.getUniformLocation( SHADER_PROGRAM, 'uFadeToBlack' );
    }


    /**
     * Update the uniforms of this preset during render
     */
    updateUniform( GL: WebGLRenderingContext ): void {
        GL.uniform1f( this.#U_FADE_TO_BLACK, this.#fadeToBlackValue );
    }
}
