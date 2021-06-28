/**
 * Preset sample
 */
export default class PresetSample implements GLImageTransitionPreset {

    #myUniformValue: number;
    #U_MY_UNIFORM!:  WebGLUniformLocation | null;


    // Fragment shader source code
    get fsSource() {
        return `
            #ifdef GL_ES
            precision mediump float;
            #endif

            // Mandatory
            varying highp vec2 vTextureCoord; // Hold texture coordinates

            // All these uniforms are mandatory
            uniform sampler2D uSampler;   // Texture 1
            uniform sampler2D uSampler2;  // Texture 2
            uniform float     uProgress;  // 0 <= uProgress <= 1
            uniform float     uTime;      // current time
            uniform float     uDeltaTime; // time ellapsed since previous render loop

            void main(void) {
                vec3 t1Color = texture2D(uSampler, vTextureCoord).rgb;
                vec3 t2Color = texture2D(uSampler2, vTextureCoord).rgb;

                vec3 color = mix( t1Color, t2Color, uProgress );

                gl_FragColor = vec4( color, 1.0 );
            }
        `;
    };

    get myUniformValue() {
        return this.#myUniformValue;
    }

    get U_MY_UNIFORM() {
        return this.#U_MY_UNIFORM;
    }


    /**
     * PresetSample constructor
     */
    constructor() {
        this.#myUniformValue = 12;
    }


    /**
     * Create specific uniforms for this preset
     */
    addUniform( GL: WebGLRenderingContext, SHADER_PROGRAM: WebGLProgram ) {
        this.#U_MY_UNIFORM = GL.getUniformLocation( SHADER_PROGRAM, 'uMyUniform' );
    }


    /**
     * Update the uniforms of this preset during render
     */
    updateUniform( GL: WebGLRenderingContext ) {
        GL.uniform1f( this.#U_MY_UNIFORM, this.#myUniformValue );
    }


    /**
     * Called each time before a transition
     */
    onTransitionStart() {
    }


    /**
     * Called each time after a transition
     */
    onTransitionEnd() {
    }
}
