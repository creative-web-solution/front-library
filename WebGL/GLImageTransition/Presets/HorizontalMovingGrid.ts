/**
 * Reveal the next image by moving horizontally the columns of a "grid"
 * Insipred by @patriciogv's Ikeda Data Stream - 2015
 */
export default class HorizontalMovingGrid implements FLib.GLImageTransition.Preset {

    #speed:    number;
    #grid:     number[];
    #U_SPEED!: WebGLUniformLocation | null;
    #U_GRID!:  WebGLUniformLocation | null;


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

            uniform float uSpeed;
            uniform vec2 uGrid;

            float random ( in float x ) {
                return fract( sin( x ) * 1e4 );
            }

            float random ( in vec2 st ) {
                return fract( sin( dot( st.xy, vec2( 12.9898, 78.233 ) ) ) * 43758.5453123 );
            }

            float pattern( vec2 st, vec2 v, float t ) {
                vec2 p = floor( st + v );
                return step( t, random( 100. + p * .000001 ) + random( p.x ) * 0.5 );
            }

            void main(void) {
                vec2 st = vTextureCoord;
                // progress must be between 0 and 1.5 but uProgress is between 0 and 1
                float progress = uProgress * 1.5;

                vec3 texture1Color = texture2D( uSampler, st ).rgb;
                vec3 texture2Color = texture2D( uSampler2, st ).rgb;

                st *= uGrid;

                vec2 ipos = floor( st );
                vec2 fpos = fract( st );

                vec2 vel = vec2( uTime / ( 1000.0 / uSpeed ) * max( uGrid.x, uGrid.y ) ); // time
                vel *= vec2( -1., 0.0 ) * random( 1.0 + ipos.y ); // direction

                // Assign a random value base on the integer coord
                vec2 offset = vec2( 0.1, 0. );

                vec3 color = vec3( 0. );
                color.r = pattern( st + offset, vel, progress );
                color.g = pattern( st,          vel, progress );
                color.b = pattern( st - offset, vel, progress );

                color *= step( 0.0, fpos.y );

                color = mix( texture1Color, texture2Color, 1.0 - color );

                gl_FragColor = vec4( color, 1.0 );
            }
        `;
    }

    get speed(): number {
        return this.#speed;
    }
    get grid(): number[] {
        return this.#grid;
    }
    get U_SPEED(): WebGLUniformLocation | null {
        return this.#U_SPEED;
    }
    get U_GRID(): WebGLUniformLocation | null {
        return this.#U_GRID;
    }


    constructor( speed = 1, grid: number[] = [ 100, 50 ] ) {
        this.#speed = speed;
        this.#grid  = grid;
    }


    /**
     * Create specific uniform for this preset
     */
    addUniform( GL: WebGLRenderingContext, SHADER_PROGRAM: WebGLProgram ): void {
        this.#U_SPEED = GL.getUniformLocation( SHADER_PROGRAM, 'uSpeed' );
        this.#U_GRID  = GL.getUniformLocation( SHADER_PROGRAM, 'uGrid' );
    }


    /**
     * Update the uniform of this preset during render
     */
    updateUniform( GL: WebGLRenderingContext ): void {
        GL.uniform1f( this.#U_SPEED, this.#speed );
        GL.uniform2fv( this.#U_GRID, this.#grid );
    }
}
