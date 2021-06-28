/**
 * Reveal the next image using cells shape
 * Insipred by @patriciogv - Simple Voronoi
 */
export default class Cellular implements GLImageTransitionPreset {

    #scale:    number;
    #seed:     number;
    #U_SCALE!: WebGLUniformLocation | null;
    #U_SEED!:  WebGLUniformLocation | null;


    get fsSource() {
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

            uniform float uScale;
            uniform float uSeed;

            vec2 random2( vec2 p, float seed ) {
                // 43758.5453
                return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*seed);
            }


            void main(void) {
                vec2 st = vTextureCoord;
                vec3 color = vec3( .0 );

                vec3 texture1Color = texture2D( uSampler, st ).rgb;
                vec3 texture2Color = texture2D( uSampler2, st ).rgb;

                float time = uTime / 1000.0;
                // progress must be between -1.0 and 1.0 but uProgress is between 0 and 1
                float progress = -1. + uProgress * 2.;

                // Scale
                st *= uScale;

                // Tile the space
                vec2 i_st = floor( st );
                vec2 f_st = fract( st );

                float m_dist = 1.;  // minimum distance

                for ( int y= -1; y <= 1; y++ ) {
                    for ( int x= -1; x <= 1; x++ ) {
                        // Neighbor place in the grid
                        vec2 neighbor = vec2( float( x ),float( y ) );

                        // Random position from current + neighbor place in the grid
                        vec2 point = random2( i_st + neighbor, uSeed );

                        // Animate the point
                        point = 0.5 + 0.5 * sin( time + 6.2831 * point );

                        // Vector between the pixel and the point
                        vec2 diff = neighbor + point - f_st;

                        // Distance to the point
                        float dist = length( diff );

                        // Keep the closer distance
                        m_dist = min( m_dist, dist );
                    }
                }

                // Draw the min distance (distance field)
                color += max( 0., min( 1.0, m_dist + progress ) );

                color = mix( texture1Color, texture2Color, color );

                gl_FragColor = vec4( color, 1.0 );
            }
        `;
    };

    get scale() {
        return this.#scale;
    }
    get seed() {
        return this.#seed;
    }
    get U_SCALE() {
        return this.#U_SCALE;
    }
    get U_SEED() {
        return this.#U_SEED;
    }


    constructor( scale: number = 10 ) {
        this.#scale = scale;
        this.#seed  = Math.random() * 45000;
    }


    /**
     * Create specific uniforms for this preset
     */
    addUniform( GL: WebGLRenderingContext, SHADER_PROGRAM: WebGLProgram ) {
        this.#U_SCALE = GL.getUniformLocation( SHADER_PROGRAM, 'uScale' );
        this.#U_SEED  = GL.getUniformLocation( SHADER_PROGRAM, 'uSeed' );
    }


    /**
     * Update the uniforms of this preset during render
     */
    updateUniform( GL: WebGLRenderingContext ) {
        GL.uniform1f( this.#U_SCALE, this.#scale );
        GL.uniform1f( this.#U_SEED,  this.#seed );
    }


    /**
     * Called each time before a transition
     */
    onTransitionStart() {
        this.#seed = Math.random() * 45000;
    }
}
