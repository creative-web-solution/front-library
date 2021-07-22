import { aClass }                           from '../../DOM/Class';
import { append }                           from '../../DOM/Manipulation';
import { createMat4, orthoMat4, scaleMat4 } from '../../WebGL/Tools/Matrix';


const DEFAULT_OPTIONS = {
    "$wrapper":          document.body,
    "context":           "webgl",
    "backgroundColor":   [ 0, 0, 0, 1 ],
    "dummyTextureColor": [ 0, 0, 1, 1 ],
    "duration":          1,
    "fitMode":           "cover"
};


const VERTEX_SHADER_SOURCE = `
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec2 vTextureCoord;

void main(void) {
    vTextureCoord = aTextureCoord;
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
`;


/**
 * Image transition based on WebGL and shaders
 *
 * @example see GLImageTransition.md
 */
export default class GLImageTransition {
    #canvasSize!:           { width: number, height: number };
    #canvasAspect!:         number;
    #rafID!:                number;
    #isImage1!:             boolean;
    #transition: {
        value:              number;
        time:               number;
        isTweening:         boolean;
        edge:               number;
        direction:          1 | -1;
    };
    #lastLoopTime:          number;
    #deltaTime!:            number;
    #imagesInfo!:           { width: number, height: number, aspect: number };

    #SHADER_PRESET:         GLImageTransitionPreset;
    #OPTIONS:               GLImageTransitionOptionsType;
    #DURATION:              number;
    #$CANVAS:               HTMLCanvasElement;
    #GL:                    WebGLRenderingContext;
    #VERTEX_BUFFER:         WebGLBuffer;
    #TEXTURE_BUFFER:        WebGLBuffer;
    #INDEX_BUFFER:          WebGLBuffer;
    #VERTEX_SHADER:         WebGLShader;
    #FRAGMENT_SHADER:       WebGLShader;
    #SHADER_PROGRAM:        WebGLProgram;
    #A_VERTEX_POSITION:     number;
    #A_TEXTURE_COORDS:      number;
    #U_PROJECTION_MATRIX:   WebGLUniformLocation;
    #U_MODEL_VIEW_MATRIX:   WebGLUniformLocation;
    #U_SAMPLER:             WebGLUniformLocation;
    #U_SAMPLER_2:           WebGLUniformLocation;
    #U_PROGRESS:            WebGLUniformLocation;
    #U_TIME:                WebGLUniformLocation;
    #U_DELTA_TIME:          WebGLUniformLocation;
    #TEXTURE_1:             WebGLTexture;
    #TEXTURE_2:             WebGLTexture;


    get $canvas() {
        return this.#$CANVAS;
    }
    get context() {
        return this.#GL;
    }
    get size() {
        return this.#canvasSize;
    }
    get aspect() {
        return this.#canvasAspect;
    }


    constructor( userOptions: GLImageTransitionOptionsType = {}) {

        this.#OPTIONS       = Object.assign( {}, DEFAULT_OPTIONS, userOptions );

        if ( !this.#OPTIONS.preset ) {
            throw 'You must add a preset that implement GLImageTransitionPreset in the options object ';
        }

        this.#SHADER_PRESET = this.#OPTIONS.preset;
        this.#DURATION      = this.#OPTIONS.duration! * 1000; // convert in ms

        this.#$CANVAS = document.createElement( 'canvas' );
        this.#OPTIONS.canvasCssClass && aClass( this.#$CANVAS, this.#OPTIONS.canvasCssClass );

        append( this.#$CANVAS, this.#OPTIONS.$wrapper! );

        this.#GL = this.#$CANVAS.getContext( this.#OPTIONS.context! ) as WebGLRenderingContext;

        if ( !this.#GL ) {
            throw 'Unable to initialize WebGL. Your browser may not support it.';
        }

        // Convert 0 -> 1 colors in 0 -> 255
        this.#OPTIONS.dummyTextureColor = this.#OPTIONS.dummyTextureColor!.map( v => v * 255 );


        this.#VERTEX_BUFFER = this.createBuffer( this.#GL.ARRAY_BUFFER, new Float32Array([
            -1.0,  1.0, 0.0,
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            1.0,  1.0, 0.0
        ]) );

        this.#TEXTURE_BUFFER = this.createBuffer( this.#GL.ARRAY_BUFFER, new Float32Array([
            0.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            1.0, 0.0
        ]) );

        this.#INDEX_BUFFER = this.createBuffer( this.#GL.ELEMENT_ARRAY_BUFFER, new Uint16Array([
            3, 2, 1,
            3, 1, 0
        ]) );


        this.#VERTEX_SHADER   = this.createShader( this.#GL.VERTEX_SHADER,   VERTEX_SHADER_SOURCE );
        this.#FRAGMENT_SHADER = this.createShader( this.#GL.FRAGMENT_SHADER, this.#SHADER_PRESET.fsSource );

        this.#SHADER_PROGRAM = this.#GL.createProgram()!;

        this.#GL.attachShader( this.#SHADER_PROGRAM, this.#VERTEX_SHADER);
        this.#GL.attachShader( this.#SHADER_PROGRAM, this.#FRAGMENT_SHADER);
        this.#GL.linkProgram(  this.#SHADER_PROGRAM);

        if ( !this.#GL.getProgramParameter( this.#SHADER_PROGRAM, this.#GL.LINK_STATUS ) ) {
            throw `Unable to initialize the shader program: ${ this.#GL.getProgramInfoLog( this.#SHADER_PROGRAM ) }`;
        }

        this.#A_VERTEX_POSITION   = this.#GL.getAttribLocation( this.#SHADER_PROGRAM, 'aVertexPosition' );
        this.#A_TEXTURE_COORDS    = this.#GL.getAttribLocation( this.#SHADER_PROGRAM, 'aTextureCoord' );

        this.#U_PROJECTION_MATRIX = this.#GL.getUniformLocation( this.#SHADER_PROGRAM, 'uProjectionMatrix' )!;
        this.#U_MODEL_VIEW_MATRIX = this.#GL.getUniformLocation( this.#SHADER_PROGRAM, 'uModelViewMatrix' )!;
        this.#U_SAMPLER           = this.#GL.getUniformLocation( this.#SHADER_PROGRAM, 'uSampler' )!;
        this.#U_SAMPLER_2         = this.#GL.getUniformLocation( this.#SHADER_PROGRAM, 'uSampler2' )!;
        this.#U_PROGRESS          = this.#GL.getUniformLocation( this.#SHADER_PROGRAM, 'uProgress' )!;
        this.#U_TIME              = this.#GL.getUniformLocation( this.#SHADER_PROGRAM, 'uTime' )!;
        this.#U_DELTA_TIME        = this.#GL.getUniformLocation( this.#SHADER_PROGRAM, 'uDeltaTime' )!;

        this.#SHADER_PRESET.addUniform && this.#SHADER_PRESET.addUniform( this.#GL, this.#SHADER_PROGRAM );

        this.#TEXTURE_1           = this.createTexture();
        this.#TEXTURE_2           = this.createTexture();

        this.#canvasSize = {
            "width":  -1,
            "height": -1
        };

        this.#transition = {
            "value":      0,
            "time":       0,
            "isTweening": false,
            "edge":       1,
            "direction":  1
        };
        this.#lastLoopTime = 0;


        this.#onResize();


        if ( this.#OPTIONS.fluid ) {
            window.addEventListener( 'resize', this.#onResize );
        }


        this.clear();
    }


    /**
     * Clean objects and remove all bindings
     */
    destroy() {
        this.#GL.deleteBuffer( this.#VERTEX_BUFFER );
        this.#GL.deleteBuffer( this.#TEXTURE_BUFFER );
        this.#GL.deleteBuffer( this.#INDEX_BUFFER );
        this.#GL.deleteProgram( this.#SHADER_PROGRAM );
        this.#GL.deleteShader( this.#FRAGMENT_SHADER );
        this.#GL.deleteShader( this.#VERTEX_SHADER );

        window.removeEventListener( 'resize', this.#onResize );
    };


    /**
     *
     * @param {Number} width
     * @param {Number} height
     */
    updateCanvasSize( width, height ) {
        if ( width === this.#canvasSize.width && height === this.#canvasSize.height ) {
            return;
        }

        this.#canvasSize = {
            "width":  width,
            "height": height
        };

        this.#canvasAspect = this.#canvasSize.width / this.#canvasSize.height;

        this.#$CANVAS.setAttribute( 'width',  `${ this.#canvasSize.width }` );
        this.#$CANVAS.setAttribute( 'height', `${ this.#canvasSize.height }` );
    };


    /**
     * Start the rendering loop
     */
    startRender() {
        this.#rafID = requestAnimationFrame( this.#render );
    };


    /**
     * Stop the rendering loop
     */
    stopRender() {
        cancelAnimationFrame( this.#rafID );
    };


    /**
     * Load and init of the first displayed image
     */
    loadAndInitImage( url: string ): this {
        this.loadImage( url, this.#TEXTURE_1, true )
            .then( $image => {
                let { naturalWidth, naturalHeight } = $image;
                this.#imagesInfo = {
                    "width":  naturalWidth,
                    "height": naturalHeight,
                    "aspect": naturalWidth / naturalHeight
                };
            } );

        this.#isImage1 = true;

        return this;
    };


    /**
     * Init of the first displayed image
     *
     * @param $image - This image is considered loaded
     */
    initImage( $image: HTMLImageElement ): this {

        this.setTexture( this.#TEXTURE_1, $image );

        let { naturalWidth, naturalHeight } = $image;

        this.#imagesInfo = {
            "width":  naturalWidth,
            "height": naturalHeight,
            "aspect": naturalWidth / naturalHeight
        };

        this.#isImage1 = true;

        return this;
    };


    /**
     * Load and update the next image to display and start the transition between the 2 images
     */
    loadAndChangeImage( url: string ): this {
        if ( this.#transition.isTweening ) {
            return this;
        }

        const currentTexture = this.#isImage1 ? this.#TEXTURE_2 : this.#TEXTURE_1;
        const transitionEdge = this.#isImage1 ? 1 : 0;

        this.loadImage( url, currentTexture, false )
            .then( () => {
                this.tweenTransition( transitionEdge );
            } );

        return this;
    };


    /**
     * Update the next image to display and start the transition between the 2 images
     *
     * @param $image - This image is considered loaded
     */
    changeImage( $image: HTMLImageElement ): this {
        if ( this.#transition.isTweening ) {
            return this;
        }

        if ( this.#isImage1 ) {
            this.setTexture( this.#TEXTURE_2, $image );
            this.tweenTransition( 1 );

            return this;
        }

        this.setTexture( this.#TEXTURE_1, $image );
        this.tweenTransition( 0 );

        return this;
    };


    private setTexture( texture: WebGLTexture, $image: TexImageSource ) {
        this.#GL.bindTexture( this.#GL.TEXTURE_2D, texture );
        this.#GL.texImage2D( this.#GL.TEXTURE_2D, 0, this.#GL.RGBA, this.#GL.RGBA, this.#GL.UNSIGNED_BYTE, $image);

        this.#GL.texParameteri( this.#GL.TEXTURE_2D, this.#GL.TEXTURE_WRAP_S, this.#GL.CLAMP_TO_EDGE );
        this.#GL.texParameteri( this.#GL.TEXTURE_2D, this.#GL.TEXTURE_WRAP_T, this.#GL.CLAMP_TO_EDGE );
        this.#GL.texParameteri( this.#GL.TEXTURE_2D, this.#GL.TEXTURE_MIN_FILTER, this.#GL.LINEAR );
    }


    private loadImage( url: string, texture: WebGLTexture, isInit: boolean ): Promise<HTMLImageElement> {

        return new Promise( ( resolve ) => {

            const $IMAGE = new Image();

            this.#OPTIONS.onImageLoading && this.#OPTIONS.onImageLoading.call( this, url, isInit );

            $IMAGE.addEventListener( 'load', () => {

                this.setTexture( texture, $IMAGE );

                this.#OPTIONS.onImageLoaded && this.#OPTIONS.onImageLoaded.call( $IMAGE, url, isInit );

                resolve( $IMAGE );
            } );


            $IMAGE.addEventListener( 'error', () => {
                this.#OPTIONS.onImageError && this.#OPTIONS.onImageError.call( $IMAGE, url, isInit );

                this.setDummyTexture( texture );

                resolve( $IMAGE );
            } );


            $IMAGE.src = url;

        } );
    }


    private getAspect(): { x: number, y: number } {
        let horizontalDrawAspect, verticalDrawAspect;


        if ( this.#OPTIONS.fitMode ===  "contains" ) {
            horizontalDrawAspect = 1;
            verticalDrawAspect   = this.#canvasAspect / this.#imagesInfo.aspect;

            if ( verticalDrawAspect > 1 ) {
                horizontalDrawAspect /= verticalDrawAspect;
                verticalDrawAspect   = 1;
            }
        }
        else {
            horizontalDrawAspect = this.#imagesInfo.aspect / this.#canvasAspect;
            verticalDrawAspect   = 1;

            if ( horizontalDrawAspect < 1 ) {
                verticalDrawAspect   /= horizontalDrawAspect;
                horizontalDrawAspect = 1;
            }
        }

        return {
            "x": horizontalDrawAspect,
            "y": verticalDrawAspect
        };
    }


    private _tween() {
        if ( this.#transition.time >= this.#DURATION ) {
            this.#transition.value      = this.#transition.edge;
            this.#transition.isTweening = false;
            this.#isImage1              = !this.#isImage1;
            this.#SHADER_PRESET.onTransitionEnd && this.#SHADER_PRESET.onTransitionEnd();
            return;
        }

        // the value of transition.value is between 0 and 1. So it's the same as the percentage of the duration
        const PERCENT   = this.#transition.time / this.#DURATION;

        if ( this.#transition.direction === 1 ) {
            this.#transition.value = PERCENT;
        }
        else {
            this.#transition.value = 1 - PERCENT;
        }

        this.#transition.time += this.#deltaTime;

        requestAnimationFrame( this._tween.bind( this ) );
    }


    private tweenTransition( edge: number ) {
        if ( this.#transition.isTweening ) {
            return;
        }

        this.#transition.edge = edge;
        this.#transition.time = 0;
        this.#SHADER_PRESET.onTransitionStart && this.#SHADER_PRESET.onTransitionStart();

        if ( edge > this.#transition.value ) {
            this.#transition.direction = 1;
        }
        else if ( edge < this.#transition.value ) {
            this.#transition.direction = -1;
        }

        this.#transition.isTweening = true;

        requestAnimationFrame( this._tween.bind( this ) );
    }


    #render = ( time ) => {

        this.#deltaTime    = time - this.#lastLoopTime;
        this.#lastLoopTime = time;

        this.clear();

        if ( !this.#imagesInfo ) {
            this.#rafID = requestAnimationFrame( this.#render );
            return;
        }

        const projectionMatrix = createMat4();
        const aspectDelta      = this.getAspect();

        orthoMat4( projectionMatrix, -1, 1, -1, 1, 0.0, 10.0 );

        const modelViewMatrix = createMat4();

        scaleMat4( modelViewMatrix, modelViewMatrix, [ aspectDelta.x, aspectDelta.y, 1, 1 ] );

        // Tell WebGL which indices to use to index the vertices
        this.#GL.bindBuffer( this.#GL.ELEMENT_ARRAY_BUFFER, this.#INDEX_BUFFER );

        // Tell WebGL to use our program when drawing

        this.#GL.useProgram( this.#SHADER_PROGRAM );


        // ATTRIBUTES

        this.#GL.bindBuffer( this.#GL.ARRAY_BUFFER, this.#VERTEX_BUFFER );
        this.#GL.vertexAttribPointer(
            this.#A_VERTEX_POSITION,
            3,
            this.#GL.FLOAT,
            false,
            0,
            0
        );
        this.#GL.enableVertexAttribArray( this.#A_VERTEX_POSITION );

        this.#GL.bindBuffer( this.#GL.ARRAY_BUFFER, this.#TEXTURE_BUFFER );
        this.#GL.vertexAttribPointer(
            this.#A_TEXTURE_COORDS,
            2,
            this.#GL.FLOAT,
            false,
            0,
            0
        );
        this.#GL.enableVertexAttribArray( this.#A_TEXTURE_COORDS );


        // UNIFORMS

        this.#GL.uniformMatrix4fv( this.#U_PROJECTION_MATRIX, false, projectionMatrix );
        this.#GL.uniformMatrix4fv( this.#U_MODEL_VIEW_MATRIX, false, modelViewMatrix );

        this.#GL.uniform1f( this.#U_PROGRESS,   this.#transition.value );
        this.#GL.uniform1f( this.#U_TIME,       time );
        this.#GL.uniform1f( this.#U_DELTA_TIME, this.#deltaTime );


        this.#SHADER_PRESET.updateUniform && this.#SHADER_PRESET.updateUniform( this.#GL );


        this.#GL.activeTexture( this.#GL.TEXTURE0 );
        this.#GL.bindTexture( this.#GL.TEXTURE_2D, this.#TEXTURE_1 );
        this.#GL.uniform1i( this.#U_SAMPLER, 0 );

        this.#GL.activeTexture( this.#GL.TEXTURE1 );
        this.#GL.bindTexture( this.#GL.TEXTURE_2D, this.#TEXTURE_2 );
        this.#GL.uniform1i( this.#U_SAMPLER_2, 1 );


        this.#GL.drawElements( this.#GL.TRIANGLES, 6, this.#GL.UNSIGNED_SHORT, 0 );

        this.#rafID = requestAnimationFrame( this.#render );
    }


    private createTexture(): WebGLTexture {
        return this.setDummyTexture( this.#GL.createTexture() as WebGLTexture );
    }


    private setDummyTexture( texture: WebGLTexture ): WebGLTexture {
        const pixel = new Uint8Array( this.#OPTIONS.dummyTextureColor! );

        this.#GL.bindTexture( this.#GL.TEXTURE_2D, texture );

        this.#GL.texImage2D( this.#GL.TEXTURE_2D, 0, this.#GL.RGBA,
                                1, 1, 0, this.#GL.RGBA, this.#GL.UNSIGNED_BYTE,
                                pixel
                            );

        return texture;
    }


    private createShader( type: number, source: string ): WebGLShader {
        const SHADER = this.#GL.createShader( type )!;

        this.#GL.shaderSource( SHADER, source );
        this.#GL.compileShader( SHADER );

        if ( !this.#GL.getShaderParameter( SHADER, this.#GL.COMPILE_STATUS ) ) {
            const ERR = `An error occurred compiling the shaders: ${ this.#GL.getShaderInfoLog( SHADER ) }`;
            this.#GL.deleteShader( SHADER );
            throw ERR;
        }

        return SHADER;
    }


    private createBuffer( target: number, data: Float32Array | Uint16Array ): WebGLBuffer {
        const buffer = this.#GL.createBuffer();

        this.#GL.bindBuffer( target, buffer );
        this.#GL.bufferData( target, data, this.#GL.STATIC_DRAW );

        return buffer!;
    }


    private clear() {
        let [ r, v, b, a ] = this.#OPTIONS.backgroundColor!;

        // Clear the canvas
        this.#GL.clearColor( r, v, b, a );

        // Clear everything
        this.#GL.clearDepth( 1.0 );

        // Enable the depth test
        this.#GL.enable( this.#GL.DEPTH_TEST );

        // Near things obscure far things
        this.#GL.depthFunc( this.#GL.LEQUAL );

        // Clear the color buffer bit
        this.#GL.clear( this.#GL.COLOR_BUFFER_BIT | this.#GL.DEPTH_BUFFER_BIT );

        this.#GL.viewport( 0, 0, this.#canvasSize.width, this.#canvasSize.height );
    }


    #onResize = () => {
        this.updateCanvasSize( this.#$CANVAS.clientWidth, this.#$CANVAS.clientHeight );
    }
}
