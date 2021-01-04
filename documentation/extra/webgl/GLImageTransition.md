# GLImageTransition


## Initialisation

With All default (if exists) options:

```js
const GLIT = new GLImageTransition( {
    "$wrapper":          document.body,
    "context":           'webgl',
    "preset":            new Solarisation(), // See related section below
    "fitMode":           GLImageTransition.FIT_COVER,
    "duration":          2,
    "backgroundColor":   [ 0, 0, 0, 1 ], // [ r, g, b, a ] - 0 <= color <= 1
    "dummyTextureColor": [ 0, 0, 1, 1 ], // [ r, g, b, a ] - 0 <= color <= 1
    "canvasCssClass":    null,
    "fluid":             false,
    "onImageLoading": ( url, isInit ) => {
        console.log( 'Start loaging image:', url, isInit );
    },
    "onImageLoaded": ( url, isInit ) => {
        console.log( 'Image loaded:', url, isInit );
    },
    "onImageError": ( url, isInit ) => {
        console.log( 'Image error:', url, isInit );
    }
} );
```

Two static variables are available for the `fitMode` options: `GLImageTransition.FIT_COVER` and `GLImageTransition.FIT_CONTAINS`.


## Use with preloaded HTMLImageElement

```js
const $img1 = new Image();
const $img2 = new Image();

preloadImageFunctionHere([ $img1, $img2 ])
                            .then( () => {
                                GLIT.initImage( $img1 );
                                GLIT.startRender();
                            } );

$img1.src = '/media/img/img-1.jpg';
$img2.src = '/media/img/img-2.jpg';


on( document.body, {
    "eventsName": "click",
    "selector": "button[data-image-num]",
    "callback": e => {
        e.preventDefault();
        GLIT.changeImage( e.target.dataset.imageNum === '1' ? $img1 : $img2 );
    }
} );
```


## Use with URLs

```js
GLIT.loadAndInitImage( '/media/img/img-1.jpg' );


GLIT.startRender();

on( document.body, {
    "eventsName": "click",
    "selector": "button[data-image-url]",
    "callback": e => {
        e.preventDefault();
        GLIT.loadAndChangeImage( e.target.dataset.imageUrl );
    }
} );
```


## Presets

A preset is a javascript class that contains a fragment shader and its uniforms if needed.

There are some available presets in the `@creative-web-solution/front-library/WebGL/GLImageTransition/Presets` folder.


## How to make a preset

Here is a simple example of a preset which make a simple fade between 2 images:

```js
export default class Fade {

    // Fragment shader source code
    fsSource = `
        #ifdef GL_ES
        precision mediump float;
        #endif

        varying highp vec2 vTextureCoord;

        uniform sampler2D uSampler;
        uniform sampler2D uSampler2;
        uniform float     uProgress;
        uniform float     uTime;
        uniform float     uDeltaTime;

        void main(void) {
            vec3 t1Color = texture2D(uSampler, vTextureCoord).rgb;
            vec3 t2Color = texture2D(uSampler2, vTextureCoord).rgb;

            vec3 color = mix( t1Color, t2Color, uProgress );

            gl_FragColor = vec4( color, 1.0 );
        }
    `;
}
```

There are few optional function. Here is a complete skeleton on a preset:

```js
export default class PresetSample {

    // Fragment shader source code
    fsSource = `...`;


    /**
     * PresetSample constructor
     */
    constructor() {
        // Example:
        this.myUniformValue = 12;
    }


    /**
     * Create specific uniforms for this preset
     *
     * @param {WebGLRenderingContext} GL
     * @param {WebGLProgram} SHADER_PROGRAM
     */
    addUniform( GL, SHADER_PROGRAM ) {
        // Example:
        this.U_MY_UNIFORM = GL.getUniformLocation( SHADER_PROGRAM, 'uMyUniform' );
    }


    /**
     * Update the uniforms of this preset during render
     *
     * @param {WebGLRenderingContext} GL
     */
    updateUniform( GL ) {
        // Example:
        GL.uniform1f( this.U_MY_UNIFORM, this.myUniformValue );
    }


    /**
     * Called each time before a transition
     */
    onTransitionStart() {
        // Example:
        this.myUniformValue = Math.random() * 12;
    }


    /**
     * Called each time after a transition
     */
    onTransitionEnd() {
    }
}
```

`fsSource` **IS** mandatory

`constructor`, `addUniform`, `updateUniform`, `onTransitionStart` and `onTransitionEnd` **are NOT** mandatory;

Your fragment shader **MUST** contains at least:

**This variying**

```
varying highp vec2 vTextureCoord; // Hold texture coordinates
```

**And these uniforms**

```
uniform sampler2D uSampler;   // Texture 1
uniform sampler2D uSampler2;  // Texture 2
uniform float     uProgress;  // Will be between 0 and 1
uniform float     uTime;      // current time
uniform float     uDeltaTime; // time ellapsed since the previous render loop
```
