/**
 * Simple fade between 2 images
 */
export default class Fade {

    fsSource = `
        #ifdef GL_ES
        precision mediump float;
        #endif

        varying highp vec2 vTextureCoord;

        uniform sampler2D uSampler;
        uniform sampler2D uSampler2;
        uniform float uProgress;
        uniform float uTime;
        uniform float uDeltaTime;

        void main(void) {
            vec3 t1Color = texture2D(uSampler, vTextureCoord).rgb;
            vec3 t2Color = texture2D(uSampler2, vTextureCoord).rgb;

            vec3 color = mix( t1Color, t2Color, uProgress );

            gl_FragColor = vec4( color, 1.0 );
        }
    `;
}
